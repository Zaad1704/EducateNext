// backend/controllers/classroomController.ts
import { Request, Response } from 'express';
import Classroom from '../models/Classroom'; // Import Classroom model
import Teacher from '../models/Teacher'; // Import Teacher model for validation
import { Types } from 'mongoose';

export const createClassroom = async (req: Request, res: Response) => {
  const { name, primaryTeacherId, capacity } = req.body;
  const institutionId = req.user?.institutionId; // Get institutionId from authenticated user

  if (!name || !primaryTeacherId || !capacity || !institutionId) {
    return res.status(400).json({ message: 'Please enter all required fields: name, primaryTeacherId, capacity, and ensure user is authenticated.' });
  }

  try {
    // Validate ObjectId formats
    if (!Types.ObjectId.isValid(primaryTeacherId)) {
        return res.status(400).json({ message: 'Invalid primary teacher ID format' });
    }
    if (!Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({ message: 'Invalid institution ID format' });
    }

    // Optional: Check if primaryTeacherId actually refers to an existing teacher
    const teacherExists = await Teacher.findById(primaryTeacherId);
    if (!teacherExists) {
        return res.status(404).json({ message: 'Primary teacher not found.' });
    }

    const newClassroom = new Classroom({
      name,
      institutionId: new Types.ObjectId(institutionId),
      primaryTeacherId: new Types.ObjectId(primaryTeacherId),
      capacity,
    });

    const classroom = await newClassroom.save();
    res.status(201).json({
      message: 'Classroom created successfully',
      classroom: {
        id: classroom._id,
        name: classroom.name,
        institutionId: classroom.institutionId,
        primaryTeacherId: classroom.primaryTeacherId,
        capacity: classroom.capacity,
      },
    });

  } catch (error: any) {
    console.error('Error creating classroom:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const listClassrooms = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId; // Filter classrooms by authenticated user's institution

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    const classrooms = await Classroom.find({ institutionId: new Types.ObjectId(institutionId) })
                                    .populate('primaryTeacherId', 'employeeId'); // Populate teacher employeeId

    res.status(200).json(classrooms);
  } catch (error: any) {
    console.error('Error listing classrooms:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
