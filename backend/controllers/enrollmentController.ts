// backend/controllers/enrollmentController.ts
import { Request, Response } from 'express';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Classroom from '../models/Classroom';
import { Types } from 'mongoose';
import { AuditLog } from '../middleware/auditLogger';

export const enrollStudent = async (req: Request, res: Response) => {
  const { studentId, classroomId } = req.body;
  const institutionId = req.user?.institutionId;

  if (!studentId || !classroomId || !institutionId) {
    return res.status(400).json({ error: 'Missing required fields: studentId, classroomId' });
  }

  try {
    // Validate ObjectId formats with proper sanitization
    const sanitizedStudentId = new Types.ObjectId(studentId);
    const sanitizedClassroomId = new Types.ObjectId(classroomId);
    const sanitizedInstitutionId = new Types.ObjectId(institutionId);

    // Check if student exists within the same institution
    const studentExists = await Student.findOne({ 
      _id: sanitizedStudentId, 
      institutionId: sanitizedInstitutionId 
    });
    if (!studentExists) {
      return res.status(404).json({ error: 'Student not found or not in this institution' });
    }

    // Check if classroom exists within the same institution
    const classroomExists = await Classroom.findOne({ 
      _id: sanitizedClassroomId, 
      institutionId: sanitizedInstitutionId 
    });
    if (!classroomExists) {
      return res.status(404).json({ error: 'Classroom not found or not in this institution' });
    }

    // Check for existing active enrollment
    const existingEnrollment = await Enrollment.findOne({
      studentId: sanitizedStudentId,
      classroomId: sanitizedClassroomId,
      status: 'active'
    });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Student is already enrolled in this classroom' });
    }

    // Create new enrollment
    const newEnrollment = new Enrollment({
      studentId: sanitizedStudentId,
      classroomId: sanitizedClassroomId,
      institutionId: sanitizedInstitutionId,
      enrollmentDate: new Date(),
      status: 'active'
    });

    const enrollment = await newEnrollment.save();

    // Log successful enrollment
    await new AuditLog({
      userId: req.user?.id,
      institutionId: req.user?.institutionId,
      action: 'CREATE',
      resource: 'enrollment',
      resourceId: enrollment._id.toString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      changes: { studentId, classroomId }
    }).save().catch(err => console.error('Audit log error:', err));

    res.status(201).json({
      message: 'Student enrolled successfully',
      enrollment: {
        id: enrollment._id,
        studentId: enrollment.studentId,
        classroomId: enrollment.classroomId,
        institutionId: enrollment.institutionId,
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status
      }
    });

  } catch (error: any) {
    // Log error securely
    await new AuditLog({
      userId: req.user?.id,
      institutionId: req.user?.institutionId,
      action: 'CREATE',
      resource: 'enrollment',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Enrollment creation failed'
    }).save().catch(err => console.error('Audit log error:', err));

    console.error('Enrollment error:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to enroll student' });
  }
};

export const listEnrollments = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;

  if (!institutionId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const sanitizedInstitutionId = new Types.ObjectId(institutionId);
    
    const enrollments = await Enrollment.find({ 
      institutionId: sanitizedInstitutionId 
    })
    .populate('studentId', 'name generatedId email')
    .populate('classroomId', 'name capacity')
    .select('studentId classroomId enrollmentDate status')
    .sort({ enrollmentDate: -1 })
    .limit(1000); // Prevent excessive data retrieval

    res.status(200).json({
      message: 'Enrollments retrieved successfully',
      count: enrollments.length,
      enrollments
    });
  } catch (error: any) {
    console.error('List enrollments error:', { message: error.message });
    res.status(500).json({ error: 'Failed to retrieve enrollments' });
  }
};
