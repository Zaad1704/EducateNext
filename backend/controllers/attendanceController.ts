// backend/controllers/attendanceController.ts
import { Request, Response } from 'express';
import AttendanceRecord from '../models/AttendanceRecord'; // Import AttendanceRecord model
import Student from '../models/Student'; // For validation
import Classroom from '../models/Classroom'; // For validation
import { Types } from 'mongoose';

export const markAttendance = async (req: Request, res: Response) => {
  const { studentId, classroomId, date, status } = req.body;
  const institutionId = req.user?.institutionId; // Get institutionId from authenticated user

  if (!studentId || !classroomId || !date || !status || !institutionId) {
    return res.status(400).json({ message: 'Please provide studentId, classroomId, date, status, and ensure user is authenticated.' });
  }

  // Validate status enum
  const validStatuses = ['present', 'absent', 'late', 'excused'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
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

    // Convert date to a Date object and normalize to start of day to prevent duplicate entries for same day
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC

    // Check if attendance record already exists for this student, classroom, and date
    const existingRecord = await AttendanceRecord.findOne({
      studentId: new Types.ObjectId(studentId),
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId),
      date: attendanceDate,
    });

    if (existingRecord) {
      // If record exists, update it
      existingRecord.status = status;
      await existingRecord.save();
      return res.status(200).json({
        message: 'Attendance record updated successfully',
        attendance: existingRecord,
      });
    }

    // If no record exists, create a new one
    const newRecord = new AttendanceRecord({
      studentId: new Types.ObjectId(studentId),
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId),
      date: attendanceDate,
      status,
    });

    const attendance = await newRecord.save();
    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: {
        id: attendance._id,
        studentId: attendance.studentId,
        classroomId: attendance.classroomId,
        date: attendance.date,
        status: attendance.status,
      },
    });

  } catch (error: any) {
    console.error('Error marking attendance:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAttendance = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId; // Filter attendance by authenticated user's institution
  const { studentId, classroomId, startDate, endDate } = req.query; // Optional filters

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
    if (classroomId) {
        if (!Types.ObjectId.isValid(classroomId as string)) {
            return res.status(400).json({ message: 'Invalid classroom ID format' });
        }
        query.classroomId = new Types.ObjectId(classroomId as string);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
        (query.date.$gte as Date).setUTCHours(0, 0, 0, 0); // Start of day
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
        (query.date.$lte as Date).setUTCHours(23, 59, 59, 999); // End of day
      }
    }

    const attendanceRecords = await AttendanceRecord.find(query)
                                                    .populate('studentId', 'name generatedId')
                                                    .populate('classroomId', 'name')
                                                    .sort({ date: -1 }); // Sort by date descending

    res.status(200).json(attendanceRecords);
  } catch (error: any) {
    console.error('Error getting attendance records:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
