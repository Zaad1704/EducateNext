import { Request, Response } from 'express';
import ReportCard from '../models/ReportCard';
import Student from '../models/Student';
import { generateReportCard } from '../services/reportCardService';
import { Types } from 'mongoose';

export const createReportCard = async (req: Request, res: Response) => {
  const { studentId, academicYear, semester } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    // Check if report card already exists
    const existingReport = await ReportCard.findOne({
      studentId: new Types.ObjectId(studentId),
      academicYear,
      semester,
      institutionId: new Types.ObjectId(institutionId),
    });

    if (existingReport) {
      return res.status(400).json({ message: 'Report card already exists for this period' });
    }

    const reportCard = await generateReportCard(studentId, academicYear, semester, institutionId);

    res.status(201).json({
      message: 'Report card generated successfully',
      reportCard,
    });

  } catch (error: any) {
    console.error('Error creating report card:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getReportCards = async (req: Request, res: Response) => {
  const { studentId, academicYear, semester } = req.query;
  const institutionId = req.user?.institutionId;

  try {
    const query: any = { institutionId: new Types.ObjectId(institutionId) };
    
    if (studentId) query.studentId = new Types.ObjectId(studentId as string);
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    const reportCards = await ReportCard.find(query)
      .populate('studentId', 'name generatedId')
      .populate('classroomId', 'name')
      .populate('subjects.subjectId', 'name code')
      .sort({ generatedAt: -1 });

    res.status(200).json(reportCards);

  } catch (error: any) {
    console.error('Error fetching report cards:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const publishReportCard = async (req: Request, res: Response) => {
  const { reportCardId } = req.params;
  const { principalRemarks } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    const reportCard = await ReportCard.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(reportCardId),
        institutionId: new Types.ObjectId(institutionId)
      },
      { 
        isPublished: true,
        principalRemarks: principalRemarks || '',
      },
      { new: true }
    );

    if (!reportCard) {
      return res.status(404).json({ message: 'Report card not found' });
    }

    res.status(200).json({
      message: 'Report card published successfully',
      reportCard,
    });

  } catch (error: any) {
    console.error('Error publishing report card:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const bulkGenerateReports = async (req: Request, res: Response) => {
  const { classroomId, academicYear, semester } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    // Get all students in the classroom
    const students = await Student.find({ 
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId)
    });

    const reportPromises = students.map(student => 
      generateReportCard(student._id.toString(), academicYear, semester, institutionId)
    );

    const reportCards = await Promise.all(reportPromises);

    res.status(201).json({
      message: 'Bulk report cards generated successfully',
      count: reportCards.length,
      reportCards,
    });

  } catch (error: any) {
    console.error('Error generating bulk report cards:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};