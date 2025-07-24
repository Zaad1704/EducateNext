import { Request, Response } from 'express';
import TeacherEvaluation from '../models/TeacherEvaluation';
import Grade from '../models/Grade';
import AttendanceRecord from '../models/AttendanceRecord';
import { Types } from 'mongoose';

export const createEvaluation = async (req: Request, res: Response) => {
  const { 
    teacherId, academicYear, semester, evaluationType, metrics, 
    strengths, areasForImprovement, goals, evaluatorComments 
  } = req.body;
  const evaluatorId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    // Calculate student performance metrics
    const studentPerformance = await calculateStudentPerformance(teacherId, academicYear, semester);
    
    // Calculate teacher attendance
    const attendance = await calculateTeacherAttendance(teacherId, academicYear, semester);
    
    // Calculate overall rating
    const overallRating = calculateOverallRating(metrics, studentPerformance, attendance);
    
    // Determine recommendation
    const recommendation = getRecommendation(overallRating);

    const evaluation = new TeacherEvaluation({
      teacherId: new Types.ObjectId(teacherId),
      evaluatorId: new Types.ObjectId(evaluatorId),
      institutionId: new Types.ObjectId(institutionId),
      academicYear,
      semester,
      evaluationType,
      metrics,
      studentPerformance,
      attendance,
      strengths: strengths || [],
      areasForImprovement: areasForImprovement || [],
      goals: goals || [],
      evaluatorComments: evaluatorComments || '',
      overallRating,
      recommendation,
      isFinalized: false,
    });

    await evaluation.save();

    res.status(201).json({
      message: 'Teacher evaluation created successfully',
      evaluation,
    });

  } catch (error: any) {
    console.error('Error creating evaluation:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEvaluations = async (req: Request, res: Response) => {
  const { teacherId, academicYear, semester, evaluationType } = req.query;
  const institutionId = req.user?.institutionId;

  try {
    const query: any = { institutionId: new Types.ObjectId(institutionId) };
    
    if (teacherId) query.teacherId = new Types.ObjectId(teacherId as string);
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (evaluationType) query.evaluationType = evaluationType;

    const evaluations = await TeacherEvaluation.find(query)
      .populate('teacherId', 'name employeeId')
      .populate('evaluatorId', 'name role')
      .sort({ evaluatedAt: -1 });

    res.status(200).json(evaluations);

  } catch (error: any) {
    console.error('Error fetching evaluations:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const finalizeEvaluation = async (req: Request, res: Response) => {
  const { evaluationId } = req.params;
  const { teacherResponse } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    const evaluation = await TeacherEvaluation.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(evaluationId),
        institutionId: new Types.ObjectId(institutionId)
      },
      { 
        isFinalized: true,
        teacherResponse: teacherResponse || '',
      },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    res.status(200).json({
      message: 'Evaluation finalized successfully',
      evaluation,
    });

  } catch (error: any) {
    console.error('Error finalizing evaluation:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const calculateStudentPerformance = async (
  teacherId: string, 
  academicYear: string, 
  semester: string
) => {
  try {
    // Get all grades for teacher's classes
    const grades = await Grade.find({
      teacherId: new Types.ObjectId(teacherId),
      academicYear,
      semester,
      isPublished: true,
    });

    if (grades.length === 0) {
      return {
        averageClassGPA: 0,
        passRate: 0,
        improvementRate: 0,
        attendanceImpact: 0,
      };
    }

    const averageClassGPA = grades.reduce((sum, grade) => sum + grade.gpa, 0) / grades.length;
    const passRate = (grades.filter(grade => grade.percentage >= 60).length / grades.length) * 100;
    
    // Simplified improvement rate calculation
    const improvementRate = Math.random() * 20 + 5; // Placeholder
    const attendanceImpact = Math.random() * 10 + 5; // Placeholder

    return {
      averageClassGPA: Math.round(averageClassGPA * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      improvementRate: Math.round(improvementRate * 100) / 100,
      attendanceImpact: Math.round(attendanceImpact * 100) / 100,
    };

  } catch (error) {
    console.error('Error calculating student performance:', error);
    return {
      averageClassGPA: 0,
      passRate: 0,
      improvementRate: 0,
      attendanceImpact: 0,
    };
  }
};

const calculateTeacherAttendance = async (
  teacherId: string,
  academicYear: string,
  semester: string
) => {
  // Simplified teacher attendance calculation
  // In real implementation, would track teacher attendance records
  const totalWorkingDays = 120; // Approximate working days in a semester
  const presentDays = Math.floor(Math.random() * 20) + 100; // 100-120 days
  const lateArrivals = Math.floor(Math.random() * 10);
  const earlyDepartures = Math.floor(Math.random() * 5);
  const attendancePercentage = (presentDays / totalWorkingDays) * 100;

  return {
    totalWorkingDays,
    presentDays,
    lateArrivals,
    earlyDepartures,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100,
  };
};

const calculateOverallRating = (metrics: any, studentPerformance: any, attendance: any): number => {
  const metricsAverage = Object.values(metrics).reduce((sum: number, value: any) => sum + value, 0) / 8;
  const performanceScore = (studentPerformance.averageClassGPA / 4) * 10;
  const attendanceScore = (attendance.attendancePercentage / 100) * 10;
  
  const overallRating = (metricsAverage * 0.6) + (performanceScore * 0.3) + (attendanceScore * 0.1);
  return Math.round(overallRating * 100) / 100;
};

const getRecommendation = (rating: number): string => {
  if (rating >= 9) return 'excellent';
  if (rating >= 7.5) return 'good';
  if (rating >= 6) return 'satisfactory';
  if (rating >= 4) return 'needs_improvement';
  return 'unsatisfactory';
};