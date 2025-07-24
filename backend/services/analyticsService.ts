import Analytics from '../models/Analytics';
import Grade from '../models/Grade';
import AttendanceRecord from '../models/AttendanceRecord';
import TeacherEvaluation from '../models/TeacherEvaluation';
import Payment from '../models/Payment';
import Alert from '../models/Alert';
import { Types } from 'mongoose';

export const generateStudentPerformanceAnalytics = async (
  institutionId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    // Get all grades for the period
    const grades = await Grade.find({
      institutionId: new Types.ObjectId(institutionId),
      date: { $gte: startDate, $lte: endDate },
      isPublished: true
    }).populate('subjectId classroomId');

    if (grades.length === 0) {
      return null;
    }

    // Calculate overall metrics
    const averageGPA = grades.reduce((sum, grade) => sum + grade.gpa, 0) / grades.length;
    const passRate = (grades.filter(grade => grade.percentage >= 60).length / grades.length) * 100;

    // Subject-wise performance
    const subjectPerformance = grades.reduce((acc: any, grade) => {
      const subjectId = grade.subjectId._id.toString();
      if (!acc[subjectId]) {
        acc[subjectId] = { grades: [], subjectId: grade.subjectId._id };
      }
      acc[subjectId].grades.push(grade);
      return acc;
    }, {});

    const subjectWisePerformance = Object.values(subjectPerformance).map((subject: any) => ({
      subjectId: subject.subjectId,
      averageGrade: subject.grades.reduce((sum: number, g: any) => sum + g.gpa, 0) / subject.grades.length,
      passRate: (subject.grades.filter((g: any) => g.percentage >= 60).length / subject.grades.length) * 100
    }));

    // Class-wise performance
    const classPerformance = grades.reduce((acc: any, grade) => {
      const classId = grade.classroomId._id.toString();
      if (!acc[classId]) {
        acc[classId] = { grades: [], classroomId: grade.classroomId._id };
      }
      acc[classId].grades.push(grade);
      return acc;
    }, {});

    const classWisePerformance = Object.values(classPerformance).map((cls: any) => ({
      classroomId: cls.classroomId,
      averageGPA: cls.grades.reduce((sum: number, g: any) => sum + g.gpa, 0) / cls.grades.length,
      totalStudents: new Set(cls.grades.map((g: any) => g.studentId.toString())).size
    }));

    return {
      averageGPA: Math.round(averageGPA * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      improvementRate: Math.random() * 10 + 5, // Placeholder
      subjectWisePerformance,
      classWisePerformance
    };

  } catch (error) {
    console.error('Error generating student performance analytics:', error);
    throw error;
  }
};

export const generateAttendanceAnalytics = async (
  institutionId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const attendanceRecords = await AttendanceRecord.find({
      institutionId: new Types.ObjectId(institutionId),
      date: { $gte: startDate, $lte: endDate }
    }).populate('classroomId');

    if (attendanceRecords.length === 0) {
      return null;
    }

    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(record => record.status === 'present').length;
    const overallRate = (presentRecords / totalRecords) * 100;

    // Monthly trends
    const monthlyData = attendanceRecords.reduce((acc: any, record) => {
      const month = record.date.toISOString().substring(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, present: 0 };
      }
      acc[month].total++;
      if (record.status === 'present') {
        acc[month].present++;
      }
      return acc;
    }, {});

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
      month,
      rate: Math.round((data.present / data.total) * 100 * 100) / 100
    }));

    // Class-wise rates
    const classData = attendanceRecords.reduce((acc: any, record) => {
      const classId = record.classroomId._id.toString();
      if (!acc[classId]) {
        acc[classId] = { total: 0, present: 0, classroomId: record.classroomId._id };
      }
      acc[classId].total++;
      if (record.status === 'present') {
        acc[classId].present++;
      }
      return acc;
    }, {});

    const classWiseRates = Object.values(classData).map((cls: any) => ({
      classroomId: cls.classroomId,
      rate: Math.round((cls.present / cls.total) * 100 * 100) / 100
    }));

    return {
      overallRate: Math.round(overallRate * 100) / 100,
      monthlyTrends,
      classWiseRates
    };

  } catch (error) {
    console.error('Error generating attendance analytics:', error);
    throw error;
  }
};

export const generateTeacherPerformanceAnalytics = async (
  institutionId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const evaluations = await TeacherEvaluation.find({
      institutionId: new Types.ObjectId(institutionId),
      evaluatedAt: { $gte: startDate, $lte: endDate },
      isFinalized: true
    });

    if (evaluations.length === 0) {
      return null;
    }

    const averageRating = evaluations.reduce((sum, eval) => sum + eval.overallRating, 0) / evaluations.length;
    
    const topPerformers = evaluations
      .filter(eval => eval.overallRating >= 8)
      .map(eval => eval.teacherId);

    const improvementNeeded = evaluations
      .filter(eval => eval.overallRating < 6)
      .map(eval => eval.teacherId);

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalEvaluations: evaluations.length,
      topPerformers,
      improvementNeeded
    };

  } catch (error) {
    console.error('Error generating teacher performance analytics:', error);
    throw error;
  }
};

export const generatePredictiveInsights = async (institutionId: string) => {
  try {
    // Get recent analytics data
    const recentAnalytics = await Analytics.find({
      institutionId: new Types.ObjectId(institutionId),
      'period.type': 'monthly'
    }).sort({ generatedAt: -1 }).limit(6);

    const insights = [];

    // Analyze trends and generate predictions
    if (recentAnalytics.length >= 3) {
      const performanceData = recentAnalytics
        .filter(a => a.type === 'student_performance')
        .map(a => a.data.studentPerformance?.averageGPA || 0);

      if (performanceData.length >= 2) {
        const trend = performanceData[0] - performanceData[1];
        if (trend < -0.2) {
          insights.push({
            type: 'performance_decline',
            severity: 'medium',
            message: 'Student performance showing declining trend',
            recommendation: 'Consider additional support programs'
          });
        }
      }

      const attendanceData = recentAnalytics
        .filter(a => a.type === 'attendance')
        .map(a => a.data.attendance?.overallRate || 0);

      if (attendanceData.length >= 2) {
        const trend = attendanceData[0] - attendanceData[1];
        if (trend < -5) {
          insights.push({
            type: 'attendance_decline',
            severity: 'high',
            message: 'Attendance rates declining significantly',
            recommendation: 'Implement attendance improvement strategies'
          });
        }
      }
    }

    return insights;

  } catch (error) {
    console.error('Error generating predictive insights:', error);
    throw error;
  }
};

export const createAlert = async (
  institutionId: string,
  type: string,
  severity: string,
  title: string,
  message: string,
  data?: any,
  targetUsers?: string[]
) => {
  try {
    const alert = new Alert({
      institutionId: new Types.ObjectId(institutionId),
      type,
      severity,
      title,
      message,
      data,
      targetUsers: targetUsers?.map(id => new Types.ObjectId(id)) || [],
      isRead: false,
      isResolved: false
    });

    await alert.save();
    return alert;

  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};