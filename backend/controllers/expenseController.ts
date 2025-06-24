// backend/controllers/expenseController.ts
import { Request, Response } from 'express';
import Expense from '../models/Expense';
import { Types } from 'mongoose';

export const addExpense = async (req: Request, res: Response) => {
  const { date, category, amount, description, receiptUrl, status } = req.body;
  const institutionId = req.user?.institutionId;
  const recordedBy = req.user?.id; // The authenticated user is the one recording

  if (!date || !category || !amount || !description || !institutionId || !recordedBy) {
    return res.status(400).json({ message: 'Please provide date, category, amount, description, and ensure user is authenticated.' });
  }

  // Validate status enum if provided
  const validStatuses = ['approved', 'pending', 'rejected'];
  if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    if (!Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({ message: 'Invalid institution ID format' });
    }
    if (!Types.ObjectId.isValid(recordedBy)) {
        return res.status(400).json({ message: 'Invalid recordedBy user ID format' });
    }

    const newExpense = new Expense({
      institutionId: new Types.ObjectId(institutionId),
      recordedBy: new Types.ObjectId(recordedBy),
      date: new Date(date),
      category,
      amount,
      description,
      receiptUrl,
      status: status || 'pending', // Default to pending if not provided
    });

    const expense = await newExpense.save();
    res.status(201).json({
      message: 'Expense added successfully',
      expense,
    });
  } catch (error: any) {
    console.error('Error adding expense:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  const { category, startDate, endDate, status } = req.query; // Filters

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    const query: any = { institutionId: new Types.ObjectId(institutionId) };

    if (category) query.category = category;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
        (query.date.$gte as Date).setUTCHours(0, 0, 0, 0);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
        (query.date.$lte as Date).setUTCHours(23, 59, 59, 999);
      }
    }

    const expenses = await Expense.find(query)
                                  .populate('recordedBy', 'name email') // Populate user who recorded
                                  .sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error: any) {
    console.error('Error fetching expenses:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
