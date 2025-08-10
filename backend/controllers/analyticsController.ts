import { Request, Response } from 'express';
import Analytics from '../models/Analytics';
import Alert from '../models/Alert';
import { 
  generateStudentPerformanceAnalytics,
  generateAttendanceAnalytics,
  generateTeacherPerformanceAnalytics,
  generatePredictiveInsights,
  createAlert
} from '../services/analyticsService';
import { Types } from 'mongoose';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  const { period = 'monthly' } = req.query;

  try {
    const endDate = new Date();
    const startDate = new Date();
    
    // Set date range based on period
    switch (period) {
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'yearly':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Get existing analytics or generate new ones
    let analytics = await Analytics.find({
      institutionId: new Types.ObjectId(institutionId),
      'period.startDate': { $gte: startDate },
      'period.endDate': { $lte: endDate }
    }).sort({ generatedAt: -1 });

    // If no recent analytics, generate them
    if (analytics.length === 0) {
      await generateAnalytics(institutionId, startDate, endDate, period as string);
      analytics = await Analytics.find({
        institutionId: new Types.ObjectId(institutionId),
        'period.startDate': { $gte: startDate },
        'period.endDate': { $lte: endDate }
      }).sort({ generatedAt: -1 });
    }

    // Get predictive insights
    const insights = await generatePredictiveInsights(institutionId);

    // Get recent alerts
    const alerts = await Alert.find({
      institutionId: new Types.ObjectId(institutionId),
      isResolved: false
    }).sort({ createdAt: -1 }).limit(10);

    return res.status(200).json({
      analytics: analytics.reduce((acc, item) => {
        acc[item.type] = item.data;
        return acc;
      }, {} as any),
      insights,
      alerts,
      period: { startDate, endDate, type: period }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard analytics:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const generateAnalyticsReport = async (req: Request, res: Response) => {
  const { type, startDate, endDate } = req.body;
  const institutionId = req.user?.institutionId;
  if (!institutionId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let analyticsData;
    
    switch (type) {
      case 'student_performance':
        analyticsData = await generateStudentPerformanceAnalytics(institutionId, start, end);
        break;
      case 'attendance':
        analyticsData = await generateAttendanceAnalytics(institutionId, start, end);
        break;
      case 'teacher_performance':
        analyticsData = await generateTeacherPerformanceAnalytics(institutionId, start, end);
        break;
      default:
        return res.status(400).json({ message: 'Invalid analytics type' });
    }

    if (!analyticsData) {
      return res.status(404).json({ message: 'No data available for the specified period' });
    }

    // Save analytics to database
    const analytics = new Analytics({
      institutionId: new Types.ObjectId(institutionId),
      type,
      data: { [type.replace('_', '')]: analyticsData },
      period: {
        startDate: start,
        endDate: end,
        type: 'custom'
      }
    });

    await analytics.save();

    return res.status(200).json({
      message: 'Analytics report generated successfully',
      data: analyticsData,
      reportId: analytics._id
    });

  } catch (error: any) {
    console.error('Error generating analytics report:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPerformanceTrends = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  const { months = 6 } = req.query;

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - parseInt(months as string));

    const analytics = await Analytics.find({
      institutionId: new Types.ObjectId(institutionId),
      type: { $in: ['student_performance', 'attendance', 'teacher_performance'] },
      'period.startDate': { $gte: startDate }
    }).sort({ 'period.startDate': 1 });

    const trends: any = {
      studentPerformance: [],
      attendance: [],
      teacherPerformance: []
    };

    analytics.forEach(item => {
      const month = item.period.startDate.toISOString().substring(0, 7);
      
      switch (item.type) {
        case 'student_performance':
          trends.studentPerformance.push({
            month,
            averageGPA: item.data.studentPerformance?.averageGPA || 0,
            passRate: item.data.studentPerformance?.passRate || 0
          });
          break;
        case 'attendance':
          trends.attendance.push({
            month,
            rate: item.data.attendance?.overallRate || 0
          });
          break;
        case 'teacher_performance':
          trends.teacherPerformance.push({
            month,
            averageRating: item.data.teacherPerformance?.averageRating || 0
          });
          break;
      }
    });

    return res.status(200).json(trends);

  } catch (error: any) {
    console.error('Error fetching performance trends:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  const { severity, type, resolved } = req.query;

  try {
    const query: any = { institutionId: new Types.ObjectId(institutionId) };
    
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (resolved !== undefined) query.isResolved = resolved === 'true';

    const alerts = await Alert.find(query)
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(alerts);

  } catch (error: any) {
    console.error('Error fetching alerts:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resolveAlert = async (req: Request, res: Response) => {
  const { alertId } = req.params;
  const userId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    const alert = await Alert.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(alertId),
        institutionId: new Types.ObjectId(institutionId)
      },
      {
        isResolved: true,
        resolvedBy: new Types.ObjectId(userId),
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    return res.status(200).json({
      message: 'Alert resolved successfully',
      alert
    });

  } catch (error: any) {
    console.error('Error resolving alert:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to generate analytics
const generateAnalytics = async (
  institutionId: string | undefined,
  startDate: Date,
  endDate: Date,
  period: string
) => {
  if (!institutionId) {
    return;
  }
  try {
    // Generate student performance analytics
    const studentPerformance = await generateStudentPerformanceAnalytics(institutionId, startDate, endDate);
    if (studentPerformance) {
      await new Analytics({
        institutionId: new Types.ObjectId(institutionId),
        type: 'student_performance',
        data: { studentPerformance },
        period: { startDate, endDate, type: period }
      }).save();
    }

    // Generate attendance analytics
    const attendance = await generateAttendanceAnalytics(institutionId, startDate, endDate);
    if (attendance) {
      await new Analytics({
        institutionId: new Types.ObjectId(institutionId),
        type: 'attendance',
        data: { attendance },
        period: { startDate, endDate, type: period }
      }).save();
    }

    // Generate teacher performance analytics
    const teacherPerformance = await generateTeacherPerformanceAnalytics(institutionId, startDate, endDate);
    if (teacherPerformance) {
      await new Analytics({
        institutionId: new Types.ObjectId(institutionId),
        type: 'teacher_performance',
        data: { teacherPerformance },
        period: { startDate, endDate, type: period }
      }).save();
    }

  } catch (error) {
    console.error('Error generating analytics:', error);
  }
};