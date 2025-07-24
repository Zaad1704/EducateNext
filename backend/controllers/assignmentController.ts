import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { Types } from 'mongoose';

export const createAssignment = async (req: Request, res: Response) => {
  const { 
    subjectId, classroomId, title, description, type, 
    maxMarks, dueDate, instructions, attachments 
  } = req.body;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    const assignment = new Assignment({
      teacherId: new Types.ObjectId(teacherId),
      subjectId: new Types.ObjectId(subjectId),
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId),
      title,
      description,
      type,
      maxMarks,
      dueDate: new Date(dueDate),
      instructions,
      attachments: attachments || [],
      isPublished: false,
    });

    await assignment.save();

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    });

  } catch (error: any) {
    console.error('Error creating assignment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
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
      .sort({ dueDate: -1 });

    res.status(200).json(assignments);

  } catch (error: any) {
    console.error('Error fetching assignments:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitAssignment = async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const { attachments } = req.body;
  const studentId = req.user?.id;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
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
      status,
    });

  } catch (error: any) {
    console.error('Error submitting assignment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};