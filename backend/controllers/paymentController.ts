// backend/controllers/paymentController.ts
import { Request, Response } from 'express';
import Payment from '../models/Payment';
import FeeBill from '../models/FeeBill';
import Student from '../models/Student';
import { Types } from 'mongoose';

export const recordPayment = async (req: Request, res: Response) => {
  const { feeBillId, amountPaid, paymentMethod, transactionId, receiptUrl } = req.body;
  const institutionId = req.user?.institutionId;

  if (!feeBillId || !amountPaid || !paymentMethod || !institutionId) {
    return res.status(400).json({ message: 'Please provide feeBillId, amountPaid, paymentMethod, and ensure user is authenticated.' });
  }

  try {
    if (!Types.ObjectId.isValid(feeBillId)) {
        return res.status(400).json({ message: 'Invalid fee bill ID format' });
    }
    if (!Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({ message: 'Invalid institution ID format' });
    }

    const feeBill = await FeeBill.findOne({ _id: feeBillId, institutionId: new Types.ObjectId(institutionId) });
    if (!feeBill) {
      return res.status(404).json({ message: 'Fee bill not found or not in this institution.' });
    }

    // Record the payment
    const newPayment = new Payment({
      feeBillId: new Types.ObjectId(feeBillId),
      studentId: feeBill.studentId, // Get studentId from feeBill
      institutionId: new Types.ObjectId(institutionId),
      amountPaid,
      paymentMethod,
      transactionId,
      receiptUrl,
    });

    const payment = await newPayment.save();

    // Update the FeeBill status and add payment reference
    feeBill.payments.push(payment._id);

    // Recalculate paid amount and update status
    const totalPaid = (await Payment.aggregate([
        { $match: { feeBillId: feeBill._id } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]))[0]?.total || 0;

    if (totalPaid >= feeBill.amount) {
      feeBill.status = 'paid';
    } else if (totalPaid > 0) {
      feeBill.status = 'partially_paid';
    } else {
      feeBill.status = 'pending'; // Should only happen if totalPaid is 0
    }
    await feeBill.save();

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
      updatedFeeBillStatus: feeBill.status,
    });

  } catch (error: any) {
    console.error('Error recording payment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  const { studentId, feeBillId } = req.query; // Filters

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    const query: any = { institutionId: new Types.ObjectId(institutionId) };
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

    const payments = await Payment.find(query)
                                  .populate('studentId', 'name generatedId')
                                  .populate('feeBillId', 'amount dueDate status')
                                  .sort({ paymentDate: -1 });

    res.status(200).json(payments);
  } catch (error: any) {
    console.error('Error listing payments:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
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
