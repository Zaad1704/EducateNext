import { Request, Response } from 'express';
import AttendanceSession from '../models/AttendanceSession';
import AttendanceRecord from '../models/AttendanceRecord';
import { Types } from 'mongoose';

export const startAttendanceSession = async (req: Request, res: Response) => {
  const { classroomId, sessionType } = req.body;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    // Check if there's already an active session
    const activeSession = await AttendanceSession.findOne({
      classroomId: new Types.ObjectId(classroomId),
      teacherId: new Types.ObjectId(teacherId),
      isActive: true,
    });

    if (activeSession) {
      return res.status(400).json({ message: 'An active session already exists for this class' });
    }

    const session = new AttendanceSession({
      classroomId: new Types.ObjectId(classroomId),
      teacherId: new Types.ObjectId(teacherId),
      institutionId: new Types.ObjectId(institutionId),
      sessionType: sessionType || 'class_start',
      date: new Date(),
      startTime: new Date(),
      isActive: true,
      attendanceRecords: [],
    });

    await session.save();

    res.status(201).json({
      message: 'Attendance session started successfully',
      session,
    });

  } catch (error: any) {
    console.error('Error starting attendance session:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const endAttendanceSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    const session = await AttendanceSession.findOneAndUpdate(
      {
        _id: new Types.ObjectId(sessionId),
        teacherId: new Types.ObjectId(teacherId),
        institutionId: new Types.ObjectId(institutionId),
        isActive: true,
      },
      {
        endTime: new Date(),
        isActive: false,
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Active session not found' });
    }

    res.status(200).json({
      message: 'Attendance session ended successfully',
      session,
    });

  } catch (error: any) {
    console.error('Error ending attendance session:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const scanQRAttendance = async (req: Request, res: Response) => {
  const { qrData, sessionId, deviceId } = req.body;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    // Validate QR code and get user info
    const qrValidation = await validateQRCode(qrData, institutionId);
    if (!qrValidation.valid) {
      return res.status(400).json({ message: 'Invalid QR code' });
    }

    // Get active session
    const session = await AttendanceSession.findOne({
      _id: new Types.ObjectId(sessionId),
      teacherId: new Types.ObjectId(teacherId),
      institutionId: new Types.ObjectId(institutionId),
      isActive: true,
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    // Check if attendance already recorded for this session
    const existingRecord = await AttendanceRecord.findOne({
      studentId: new Types.ObjectId(qrValidation.userId),
      sessionId: new Types.ObjectId(sessionId),
      scanType: session.sessionType,
    });

    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance already recorded for this session' });
    }

    // Create attendance record
    const attendanceRecord = new AttendanceRecord({
      studentId: new Types.ObjectId(qrValidation.userId),
      teacherId: new Types.ObjectId(teacherId),
      classroomId: session.classroomId,
      institutionId: new Types.ObjectId(institutionId),
      sessionId: new Types.ObjectId(sessionId),
      date: session.date,
      scanTime: new Date(),
      status: 'present',
      scanType: session.sessionType,
      scanMethod: 'qr_scan',
      deviceId,
      isVerified: true,
    });

    await attendanceRecord.save();

    // Update session with attendance record
    await AttendanceSession.findByIdAndUpdate(sessionId, {
      $push: { attendanceRecords: attendanceRecord._id }
    });

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendanceRecord,
      studentInfo: qrValidation.userInfo,
    });

  } catch (error: any) {
    console.error('Error scanning QR attendance:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getActiveSessions = async (req: Request, res: Response) => {
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    const sessions = await AttendanceSession.find({
      teacherId: new Types.ObjectId(teacherId),
      institutionId: new Types.ObjectId(institutionId),
      isActive: true,
    })
    .populate('classroomId', 'name')
    .populate('attendanceRecords')
    .sort({ startTime: -1 });

    res.status(200).json(sessions);

  } catch (error: any) {
    console.error('Error fetching active sessions:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSessionHistory = async (req: Request, res: Response) => {
  const { classroomId, startDate, endDate } = req.query;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    const query: any = {
      teacherId: new Types.ObjectId(teacherId),
      institutionId: new Types.ObjectId(institutionId),
    };

    if (classroomId) query.classroomId = new Types.ObjectId(classroomId as string);
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const sessions = await AttendanceSession.find(query)
      .populate('classroomId', 'name')
      .populate({
        path: 'attendanceRecords',
        populate: {
          path: 'studentId',
          select: 'name generatedId'
        }
      })
      .sort({ date: -1, startTime: -1 });

    res.status(200).json(sessions);

  } catch (error: any) {
    console.error('Error fetching session history:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to validate QR code
const validateQRCode = async (qrData: string, institutionId: string) => {
  try {
    // This would integrate with your QR validation service
    // For now, returning mock validation
    return {
      valid: true,
      userId: new Types.ObjectId().toString(),
      userType: 'student',
      userInfo: {
        name: 'John Doe',
        id: 'STU001',
      }
    };
  } catch (error) {
    return { valid: false };
  }
};