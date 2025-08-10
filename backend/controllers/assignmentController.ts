import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { Types } from 'mongoose';
import { AuditLog } from '../middleware/auditLogger';
import DOMPurify from 'isomorphic-dompurify';

export const createAssignment = async (req: Request, res: Response) => {
  const { subjectId, classroomId, title, description, type, maxMarks, dueDate, instructions, attachments } = req.body;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    const assignment = new Assignment({
      teacherId: new Types.ObjectId(teacherId),
      subjectId: new Types.ObjectId(subjectId),
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId),
      title: DOMPurify.sanitize(title),
      description: DOMPurify.sanitize(description),
      type,
      maxMarks,
      dueDate: new Date(dueDate),
      instructions: DOMPurify.sanitize(instructions),
      attachments: attachments || [],
      isPublished: false,
    });

    await assignment.save();

    await new AuditLog({
      userId: req.user?.id,
      institutionId: req.user?.institutionId,
      action: 'CREATE',
      resource: 'assignment',
      resourceId: assignment._id.toString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    }).save().catch(err => console.error('Audit log error:', err));

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });

  } catch (error: any) {
    console.error('Assignment creation error:', { message: error.message });
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  const { classroomId, subjectId, type } = req.query;
  const institutionId = req.user?.institutionId;

  try {
    const query: any = { institutionId: new Types.ObjectId(institutionId) };
    
    if (classroomId) query.classroomId = new Types.ObjectId(classroomId as string);
    if (subjectId) query.subjectId = new Types.ObjectId(subjectId as string);
    if (type) query.type = type;

    const assignments = await Assignment.find(query)
      .populate('teacherId', 'name')
      .populate('subjectId', 'name code')
      .populate('classroomId', 'name')
      .sort({ dueDate: -1 })
      .limit(100);

    res.status(200).json({ assignments, count: assignments.length });

  } catch (error: any) {
    console.error('Assignment fetch error:', { message: error.message });
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const submitAssignment = async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const { attachments } = req.body;
  const studentId = req.user?.id;

  try {
    const assignment = await Assignment.findById(new Types.ObjectId(assignmentId));
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const now = new Date();
    const status = now > assignment.dueDate ? 'late' : 'submitted';

    const existingSubmission = assignment.submissions.find(
      sub => sub.studentId.toString() === studentId
    );

    if (existingSubmission) {
      existingSubmission.submittedAt = now;
      existingSubmission.attachments = attachments || [];
      existingSubmission.status = status;
    } else {
      assignment.submissions.push({
        studentId: new Types.ObjectId(studentId),
        submittedAt: now,
        attachments: attachments || [],
        status,
      });
    }

    await assignment.save();

    res.status(200).json({
      message: 'Assignment submitted successfully',
      status
    });

  } catch (error: any) {
    console.error('Assignment submission error:', { message: error.message });
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
};