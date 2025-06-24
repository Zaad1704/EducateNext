// backend/controllers/subjectController.ts
import { Request, Response } from 'express';
import Subject from '../models/Subject'; // Import Subject model
import { Types } from 'mongoose';

export const createSubject = async (req: Request, res: Response) => {
  const { name } = req.body;
  const institutionId = req.user?.institutionId; // Get institutionId from authenticated user

  if (!name || !institutionId) {
    return res.status(400).json({ message: 'Please enter subject name and ensure user is authenticated.' });
  }

  try {
    // Check if subject with this name already exists for this institution
    const existingSubject = await Subject.findOne({ name, institutionId: new Types.ObjectId(institutionId) });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this name already exists for this institution.' });
    }

    const newSubject = new Subject({
      name,
      institutionId: new Types.ObjectId(institutionId),
    });

    const subject = await newSubject.save();
    res.status(201).json({
      message: 'Subject created successfully',
      subject: {
        id: subject._id,
        name: subject.name,
        institutionId: subject.institutionId,
      },
    });

  } catch (error: any) {
    console.error('Error creating subject:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const listSubjects = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId; // Filter subjects by authenticated user's institution

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    const subjects = await Subject.find({ institutionId: new Types.ObjectId(institutionId) });
    res.status(200).json(subjects);
  } catch (error: any) {
    console.error('Error listing subjects:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
