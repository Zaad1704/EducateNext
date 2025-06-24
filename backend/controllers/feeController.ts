// backend/controllers/feeController.ts
import { Request, Response } from 'express';
import FeeBill from '../models/FeeBill';
import Student from '../models/Student';
import { Types } from 'mongoose';

export const createFeeBill = async (req: Request, res: Response) => {
  const { studentId, academicYear, amount, dueDate, items } = req.body;
  const institutionId = req.user?.institutionId;

  if (!studentId || !academicYear || !amount || !dueDate || !items || !institutionId) {
    return res.status(400).json({ message: 'Please provide studentId, academicYear, amount, dueDate, items, and ensure user is authenticated.' });
  }

  try {
    if (!Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: 'Invalid student ID format' });
    }
    if (!Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({ message: 'Invalid institution ID format' });
    }

    const studentExists = await Student.findOne({ _id: studentId, institutionId: new Types.ObjectId(institutionId) });
    if (!studentExists) {
        return res.status(404).json({ message: 'Student not found or not in this institution.' });
    }

    const newFeeBill = new FeeBill({
      studentId: new Types.ObjectId(studentId),
      institutionId: new Types.ObjectId(institutionId),
      academicYear,
      amount,
      dueDate: new Date(dueDate),
      issueDate: new Date(),
      items,
      status: 'pending',
    });

    const feeBill = await newFeeBill.save();
    res.status(201).json({
      message: 'Fee bill created successfully',
      feeBill,
    });
  } catch (error: any) {
    console.error('Error creating fee bill:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFeeBills = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  const { studentId, academicYear, status } = req.query; // Filters

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
    if (academicYear) query.academicYear = parseInt(academicYear as string);
    if (status) query.status = status;

    const feeBills = await FeeBill.find(query)
                                  .populate('studentId', 'name generatedId')
                                  .sort({ dueDate: 1 }); // Sort by due date ascending

    res.status(200).json(feeBills);
  } catch (error: any) {
    console.error('Error fetching fee bills:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// You might also add updateFeeBillStatus, deleteFeeBill, etc. later
