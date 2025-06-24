// backend/controllers/enrollmentController.ts
import { Request, Response } from 'express';
import Enrollment from '../models/Enrollment'; // Import Enrollment model
import Student from '../models/Student'; // Import Student model for validation
import Classroom from '../models/Classroom'; // Import Classroom model for validation
import { Types } from 'mongoose';

export const enrollStudent = async (req: Request, res: Response) => {
  const { studentId, classroomId } = req.body;
  const institutionId = req.user?.institutionId; // Get institutionId from authenticated user

  if (!studentId || !classroomId || !institutionId) {
    return res.status(400).json({ message: 'Please provide studentId, classroomId, and ensure user is authenticated.' });
  }

  try {
    // Validate ObjectId formats
    if (!Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: 'Invalid student ID format' });
    }
    if (!Types.ObjectId.isValid(classroomId)) {
        return res.status(400).json({ message: 'Invalid classroom ID format' });
    }
    if (!Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({ message: 'Invalid institution ID format' });
    }

    // Check if student and classroom exist within the same institution
    const studentExists = await Student.findOne({ _id: studentId, institutionId: new Types.ObjectId(institutionId) });
    if (!studentExists) {
        return res.status(404).json({ message: 'Student not found or not in this institution.' });
    }
    const classroomExists = await Classroom.findOne({ _id: classroomId, institutionId: new Types.ObjectId(institutionId) });
    if (!classroomExists) {
        return res.status(404).json({ message: 'Classroom not found or not in this institution.' });
    }

    // Check if student is already enrolled in this classroom
    const existingEnrollment = await Enrollment.findOne({
      studentId: new Types.ObjectId(studentId),
      classroomId: new Types.ObjectId(classroomId),
      status: 'active', // Only check active enrollments
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Student is already actively enrolled in this classroom.' });
    }

    const newEnrollment = new Enrollment({
      studentId: new Types.ObjectId(studentId),
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId),
      enrollmentDate: new Date(), // Set current date
      status: 'active', // Default status
    });

    const enrollment = await newEnrollment.save();
    res.status(201).json({
      message: 'Student enrolled successfully',
      enrollment: {
        id: enrollment._id,
        studentId: enrollment.studentId,
        classroomId: enrollment.classroomId,
        institutionId: enrollment.institutionId,
        enrollmentDate: enrollment.enrollmentDate,
      },
    });

  } catch (error: any) {
    console.error('Error enrolling student:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const listEnrollments = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId; // Filter enrollments by authenticated user's institution

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    const enrollments = await Enrollment.find({ institutionId: new Types.ObjectId(institutionId) })
                                        .populate('studentId', 'name generatedId') // Populate student name and ID
                                        .populate('classroomId', 'name'); // Populate classroom name

    res.status(200).json(enrollments);
  } catch (error: any) {
    console.error('Error listing enrollments:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
