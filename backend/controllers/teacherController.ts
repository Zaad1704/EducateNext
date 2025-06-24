// backend/controllers/teacherController.ts
import { Request, Response } from 'express';
import Teacher from '../models/Teacher'; // Import Teacher model
import User from '../models/User'; // Import User model (as Teacher links to User)
import { generateTeacherId } from '../services/idGeneratorService'; // Import ID generator service
import { Types } from 'mongoose';

export const addTeacher = async (req: Request, res: Response) => {
  const { userId, assignedClassroomIds } = req.body; // Assuming userId is provided and a corresponding User exists

  // The institutionId for the teacher should come from the authenticated user
  const institutionId = req.user?.institutionId;

  if (!userId || !institutionId) {
    return res.status(400).json({ message: 'Please provide userId and ensure user is authenticated.' });
  }

  try {
    // Validate ObjectId formats
    if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    if (assignedClassroomIds && !Array.isArray(assignedClassroomIds)) {
        return res.status(400).json({ message: 'assignedClassroomIds must be an array' });
    }
    if (assignedClassroomIds && assignedClassroomIds.some((id: string) => !Types.ObjectId.isValid(id))) {
        return res.status(400).json({ message: 'Invalid classroom ID format in assignedClassroomIds' });
    }

    // Check if the user ID provided actually exists and has a 'Teacher' role
    const userExists = await User.findById(userId);
    if (!userExists) {
        return res.status(404).json({ message: 'User not found.' });
    }
    // Optional: You might want to enforce that the user's role is 'Teacher' here
    // if (userExists.role !== 'Teacher') {
    //     return res.status(400).json({ message: 'User must have a Teacher role to be added as a teacher profile.' });
    // }

    // Check if a Teacher profile already exists for this userId
    const existingTeacher = await Teacher.findOne({ userId });
    if (existingTeacher) {
        return res.status(400).json({ message: 'Teacher profile already exists for this user.' });
    }

    // Generate unique employee ID
    const employeeId = await generateTeacherId(institutionId); // institutionId is used by the generator

    const newTeacher = new Teacher({
      userId: new Types.ObjectId(userId),
      employeeId,
      assignedClassroomIds: assignedClassroomIds ? assignedClassroomIds.map((id: string) => new Types.ObjectId(id)) : [],
    });

    const teacher = await newTeacher.save();
    res.status(201).json({
      message: 'Teacher added successfully',
      teacher: {
        id: teacher._id,
        userId: teacher.userId,
        employeeId: teacher.employeeId,
        assignedClassroomIds: teacher.assignedClassroomIds,
      },
    });

  } catch (error: any) {
    console.error('Error adding teacher:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const listTeachers = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId; // Filter teachers by authenticated user's institution

  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
  }

  try {
    // Find users who have the role 'Teacher' and belong to the institution
    // Then find their corresponding Teacher profiles.
    const teachers = await User.aggregate([
      {
        $match: {
          role: 'Teacher',
          institutionId: new Types.ObjectId(institutionId),
        },
      },
      {
        $lookup: {
          from: 'teachers', // The collection name for Teacher model (Mongoose pluralizes by default)
          localField: '_id',
          foreignField: 'userId',
          as: 'teacherProfile',
        },
      },
      {
        $unwind: {
          path: '$teacherProfile',
          preserveNullAndEmptyArrays: true, // Keep users who don't have a teacherProfile yet
        },
      },
      {
        $lookup: {
          from: 'classrooms', // The collection name for Classroom model
          localField: 'teacherProfile.assignedClassroomIds',
          foreignField: '_id',
          as: 'assignedClassrooms',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          employeeId: '$teacherProfile.employeeId',
          assignedClassroomNames: '$assignedClassrooms.name',
          photoUrl: 1,
          permanentAddress: 1,
          govtIdUrl: 1,
          qualifications: 1,
          certifications: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json(teachers);
  } catch (error: any) {
    console.error('Error listing teachers:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
