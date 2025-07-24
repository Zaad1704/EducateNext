import { Request, Response } from 'express';
import Grade from '../models/Grade';
import ReportCard from '../models/ReportCard';
import Student from '../models/Student';
import { calculateGPA, calculateGrade } from '../services/gradingService';
import { Types } from 'mongoose';

export const createGrade = async (req: Request, res: Response) => {
  const { 
    studentId, subjectId, classroomId, academicYear, semester, 
    gradeType, title, maxMarks, obtainedMarks, date, remarks, weightage 
  } = req.body;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  if (!studentId || !subjectId || !classroomId || !academicYear || !semester || 
      !gradeType || !title || !maxMarks || obtainedMarks === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const percentage = (obtainedMarks / maxMarks) * 100;
    const grade = calculateGrade(percentage);
    const gpa = calculateGPA(percentage);

    const newGrade = new Grade({
      studentId: new Types.ObjectId(studentId),
      teacherId: new Types.ObjectId(teacherId),
      subjectId: new Types.ObjectId(subjectId),
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId),
      academicYear,
      semester,
      gradeType,
      title,
      maxMarks,
      obtainedMarks,
      percentage,
      grade,
      gpa,
      date: new Date(date),
      remarks,
      weightage: weightage || 1,
      isPublished: false,
    });

    await newGrade.save();

    res.status(201).json({
      message: 'Grade created successfully',
      grade: newGrade,
    });

  } catch (error: any) {
    console.error('Error creating grade:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentGrades = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { academicYear, semester, subjectId } = req.query;
  const institutionId = req.user?.institutionId;

  try {
    const query: any = { 
      studentId: new Types.ObjectId(studentId),
      institutionId: new Types.ObjectId(institutionId),
      isPublished: true 
    };

    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (subjectId) query.subjectId = new Types.ObjectId(subjectId as string);

    const grades = await Grade.find(query)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name')
      .sort({ date: -1 });

    res.status(200).json(grades);

  } catch (error: any) {
    console.error('Error fetching student grades:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const publishGrades = async (req: Request, res: Response) => {
  const { gradeIds } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    await Grade.updateMany(
      { 
        _id: { $in: gradeIds.map((id: string) => new Types.ObjectId(id)) },
        institutionId: new Types.ObjectId(institutionId)
      },
      { isPublished: true }
    );

    res.status(200).json({ message: 'Grades published successfully' });

  } catch (error: any) {
    console.error('Error publishing grades:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const calculateStudentGPA = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { academicYear, semester } = req.query;
  const institutionId = req.user?.institutionId;

  try {
    const grades = await Grade.find({
      studentId: new Types.ObjectId(studentId),
      institutionId: new Types.ObjectId(institutionId),
      academicYear,
      semester,
      isPublished: true,
    });

    if (grades.length === 0) {
      return res.status(404).json({ message: 'No published grades found' });
    }

    // Calculate weighted GPA
    let totalWeightedGPA = 0;
    let totalWeightage = 0;

    grades.forEach(grade => {
      totalWeightedGPA += grade.gpa * grade.weightage;
      totalWeightage += grade.weightage;
    });

    const overallGPA = totalWeightage > 0 ? totalWeightedGPA / totalWeightage : 0;
    const overallPercentage = grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length;

    res.status(200).json({
      studentId,
      academicYear,
      semester,
      overallGPA: Math.round(overallGPA * 100) / 100,
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      totalGrades: grades.length,
      gradeBreakdown: grades.map(grade => ({
        subject: grade.subjectId,
        gpa: grade.gpa,
        percentage: grade.percentage,
        weightage: grade.weightage,
      })),
    });

  } catch (error: any) {
    console.error('Error calculating GPA:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};