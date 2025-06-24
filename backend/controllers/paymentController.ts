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
