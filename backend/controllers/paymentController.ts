// backend/controllers/paymentController.ts
import { Request, Response } from 'express';
import Payment from '../models/Payment';
import FeeBill from '../models/FeeBill';
import Student from '../models/Student';
import { Types } from 'mongoose';
import { securityUtils } from '../config/security';
import { AuditLog } from '../middleware/auditLogger';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

export const recordPayment = async (req: Request, res: Response) => {
  const { feeBillId, amountPaid, paymentMethod, transactionId, receiptUrl, currency = 'USD' } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const institutionId = req.user?.institutionId;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Enhanced validation
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'PAYMENT_VALIDATION_FAILED',
        resource: 'payment_processing',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Payment validation failed',
        sensitiveData: false,
        metadata: { errors: validationErrors.array() }
      }).save().catch(err => console.error('Failed to log validation error:', err));
      
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors.array()
      });
    }

    // Authorization check - only admins and authorized personnel can record payments
    if (!['admin', 'finance', 'cashier'].includes(userRole)) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'PAYMENT_RECORD_UNAUTHORIZED',
        resource: 'payment_processing',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Unauthorized payment recording attempt',
        sensitiveData: true,
        metadata: { userRole, feeBillId }
      }).save().catch(err => console.error('Failed to log unauthorized payment:', err));
      
      return res.status(403).json({ message: 'Unauthorized to record payments' });
    }

    // Validate ObjectIds
    if (!Types.ObjectId.isValid(feeBillId)) {
      return res.status(400).json({ message: 'Invalid fee bill ID format' });
    }

    // Validate payment amount
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0 || amount > 1000000) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    // Validate payment method
    const allowedMethods = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'online'];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Find and validate fee bill
    const feeBill = await FeeBill.findOne({ 
      _id: new Types.ObjectId(feeBillId), 
      institutionId: new Types.ObjectId(institutionId) 
    }).populate('studentId', 'name generatedId');
    
    if (!feeBill) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'PAYMENT_INVALID_FEEBILL',
        resource: 'payment_processing',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Payment attempt for non-existent fee bill',
        sensitiveData: true,
        metadata: { feeBillId }
      }).save().catch(err => console.error('Failed to log invalid fee bill:', err));
      
      return res.status(404).json({ message: 'Fee bill not found' });
    }

    // Check if fee bill is already fully paid
    if (feeBill.status === 'paid') {
      return res.status(400).json({ message: 'Fee bill is already fully paid' });
    }

    // Calculate remaining amount
    const totalPaid = (await Payment.aggregate([
      { $match: { feeBillId: feeBill._id } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]))[0]?.total || 0;

    const remainingAmount = feeBill.amount - totalPaid;
    
    if (amount > remainingAmount) {
      return res.status(400).json({ 
        message: 'Payment amount exceeds remaining balance',
        remainingAmount,
        attemptedAmount: amount
      });
    }

    // Generate secure payment reference
    const paymentReference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create payment record with enhanced security
    const newPayment = new Payment({
      feeBillId: new Types.ObjectId(feeBillId),
      studentId: feeBill.studentId._id,
      institutionId: new Types.ObjectId(institutionId),
      amountPaid: amount,
      currency: securityUtils.sanitizeInput(currency),
      paymentMethod: securityUtils.sanitizeInput(paymentMethod),
      transactionId: transactionId ? securityUtils.sanitizeInput(transactionId) : paymentReference,
      receiptUrl: receiptUrl ? securityUtils.sanitizeInput(receiptUrl) : null,
      paymentReference,
      recordedBy: new Types.ObjectId(userId),
      paymentDate: new Date(),
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const payment = await newPayment.save();

    // Update fee bill status
    feeBill.payments.push(payment._id);
    const newTotalPaid = totalPaid + amount;
    
    if (newTotalPaid >= feeBill.amount) {
      feeBill.status = 'paid';
      feeBill.paidAt = new Date();
    } else if (newTotalPaid > 0) {
      feeBill.status = 'partially_paid';
    }
    
    feeBill.updatedAt = new Date();
    await feeBill.save();

    // Log successful payment
    await new AuditLog({
      userId,
      institutionId,
      action: 'PAYMENT_RECORDED',
      resource: 'payment_processing',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: true,
      errorMessage: null,
      sensitiveData: true,
      metadata: {
        paymentId: payment._id.toString(),
        paymentReference,
        studentId: feeBill.studentId._id.toString(),
        amount,
        paymentMethod,
        newStatus: feeBill.status,
        remainingBalance: feeBill.amount - newTotalPaid
      }
    }).save().catch(err => console.error('Failed to log payment:', err));

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: {
        id: payment._id,
        paymentReference,
        amount: payment.amountPaid,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        status: payment.status
      },
      feeBill: {
        id: feeBill._id,
        status: feeBill.status,
        totalAmount: feeBill.amount,
        paidAmount: newTotalPaid,
        remainingAmount: feeBill.amount - newTotalPaid
      }
    });

  } catch (error: any) {
    console.error('Error recording payment:', error);
    
    await new AuditLog({
      userId,
      institutionId,
      action: 'PAYMENT_RECORD_ERROR',
      resource: 'payment_processing',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: error.message,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log payment error:', err));
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  const { studentId, feeBillId, startDate, endDate, paymentMethod, status } = req.query;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const institutionId = req.user?.institutionId;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Authorization check
    if (!['admin', 'finance', 'cashier', 'teacher'].includes(userRole)) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'PAYMENT_ACCESS_UNAUTHORIZED',
        resource: 'payment_access',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Unauthorized payment access attempt',
        sensitiveData: true,
        metadata: { userRole }
      }).save().catch(err => console.error('Failed to log unauthorized access:', err));
      
      return res.status(403).json({ message: 'Unauthorized to access payment data' });
    }

    // Build secure query
    const query: any = { institutionId: new Types.ObjectId(institutionId) };
    
    // Validate and add filters
    if (studentId) {
      if (!Types.ObjectId.isValid(studentId as string)) {
        return res.status(400).json({ message: 'Invalid student ID format' });
      }
      query.studentId = new Types.ObjectId(studentId as string);
    }
    
    if (feeBillId) {
      if (!Types.ObjectId.isValid(feeBillId as string)) {
        return res.status(400).json({ message: 'Invalid fee bill ID format' });
      }
      query.feeBillId = new Types.ObjectId(feeBillId as string);
    }
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ message: 'Invalid start date format' });
        }
        query.paymentDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ message: 'Invalid end date format' });
        }
        query.paymentDate.$lte = end;
      }
    }
    
    if (paymentMethod) {
      query.paymentMethod = securityUtils.sanitizeInput(paymentMethod as string);
    }
    
    if (status) {
      query.status = securityUtils.sanitizeInput(status as string);
    }

    // Execute query with pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('studentId', 'name generatedId')
        .populate('feeBillId', 'amount dueDate status')
        .populate('recordedBy', 'name')
        .select('-__v')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query)
    ]);

    // Log payment access
    await new AuditLog({
      userId,
      institutionId,
      action: 'PAYMENTS_ACCESSED',
      resource: 'payment_access',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: true,
      errorMessage: null,
      sensitiveData: true,
      metadata: {
        paymentsCount: payments.length,
        totalRecords: total,
        filters: { studentId, feeBillId, startDate, endDate, paymentMethod, status },
        pagination: { page, limit }
      }
    }).save().catch(err => console.error('Failed to log payment access:', err));

    res.status(200).json({
      payments,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: payments.length,
        totalRecords: total
      }
    });

  } catch (error: any) {
    console.error('Error fetching payments:', error);
    
    await new AuditLog({
      userId,
      institutionId,
      action: 'PAYMENT_ACCESS_ERROR',
      resource: 'payment_access',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: error.message,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log payment access error:', err));
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  return recordPayment(req, res);
};

export const getPaymentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const institutionId = req.user?.institutionId;

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findOne({ 
      _id: id, 
      institutionId: new Types.ObjectId(institutionId) 
    })
    .populate('studentId', 'name generatedId')
    .populate('feeBillId', 'amount dueDate status');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error: any) {
    console.error('Error getting payment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const institutionId = req.user?.institutionId;
  const updateData = req.body;

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findOneAndUpdate(
      { _id: id, institutionId: new Types.ObjectId(institutionId) },
      updateData,
      { new: true, runValidators: true }
    ).populate('studentId', 'name generatedId')
     .populate('feeBillId', 'amount dueDate status');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error: any) {
    console.error('Error updating payment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const institutionId = req.user?.institutionId;

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findOneAndDelete({ 
      _id: id, 
      institutionId: new Types.ObjectId(institutionId) 
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting payment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPaymentStats = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  const { startDate, endDate } = req.query;

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    const query: any = { institutionId: new Types.ObjectId(institutionId) };
    
    if (startDate && endDate) {
      query.paymentDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const stats = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amountPaid' },
          averageAmount: { $avg: '$amountPaid' }
        }
      }
    ]);

    const paymentMethods = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountPaid' }
        }
      }
    ]);

    res.status(200).json({
      summary: stats[0] || { totalPayments: 0, totalAmount: 0, averageAmount: 0 },
      paymentMethods
    });
  } catch (error: any) {
    console.error('Error getting payment stats:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
