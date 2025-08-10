"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAlert = exports.getAlerts = exports.getPerformanceTrends = exports.generateAnalyticsReport = exports.getDashboardAnalytics = void 0;
const Analytics_1 = __importDefault(require("../models/Analytics"));
const Alert_1 = __importDefault(require("../models/Alert"));
const analyticsService_1 = require("../services/analyticsService");
const mongoose_1 = require("mongoose");
const getDashboardAnalytics = async (req, res) => {
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
        let analytics = await Analytics_1.default.find({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            'period.startDate': { $gte: startDate },
            'period.endDate': { $lte: endDate }
        }).sort({ generatedAt: -1 });
        // If no recent analytics, generate them
        if (analytics.length === 0) {
            await generateAnalytics(institutionId, startDate, endDate, period);
            analytics = await Analytics_1.default.find({
                institutionId: new mongoose_1.Types.ObjectId(institutionId),
                'period.startDate': { $gte: startDate },
                'period.endDate': { $lte: endDate }
            }).sort({ generatedAt: -1 });
        }
        // Get predictive insights
        const insights = await (0, analyticsService_1.generatePredictiveInsights)(institutionId);
        // Get recent alerts
        const alerts = await Alert_1.default.find({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            isResolved: false
        }).sort({ createdAt: -1 }).limit(10);
        return res.status(200).json({
            analytics: analytics.reduce((acc, item) => {
                acc[item.type] = item.data;
                return acc;
            }, {}),
            insights,
            alerts,
            period: { startDate, endDate, type: period }
        });
    }
    catch (error) {
        console.error('Error fetching dashboard analytics:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
const generateAnalyticsReport = async (req, res) => {
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
                analyticsData = await (0, analyticsService_1.generateStudentPerformanceAnalytics)(institutionId, start, end);
                break;
            case 'attendance':
                analyticsData = await (0, analyticsService_1.generateAttendanceAnalytics)(institutionId, start, end);
                break;
            case 'teacher_performance':
                analyticsData = await (0, analyticsService_1.generateTeacherPerformanceAnalytics)(institutionId, start, end);
                break;
            default:
                return res.status(400).json({ message: 'Invalid analytics type' });
        }
        if (!analyticsData) {
            return res.status(404).json({ message: 'No data available for the specified period' });
        }
        // Save analytics to database
        const analytics = new Analytics_1.default({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
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
    }
    catch (error) {
        console.error('Error generating analytics report:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.generateAnalyticsReport = generateAnalyticsReport;
const getPerformanceTrends = async (req, res) => {
    const institutionId = req.user?.institutionId;
    const { months = 6 } = req.query;
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - parseInt(months));
        const analytics = await Analytics_1.default.find({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            type: { $in: ['student_performance', 'attendance', 'teacher_performance'] },
            'period.startDate': { $gte: startDate }
        }).sort({ 'period.startDate': 1 });
        const trends = {
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
    }
    catch (error) {
        console.error('Error fetching performance trends:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getPerformanceTrends = getPerformanceTrends;
const getAlerts = async (req, res) => {
    const institutionId = req.user?.institutionId;
    const { severity, type, resolved } = req.query;
    try {
        const query = { institutionId: new mongoose_1.Types.ObjectId(institutionId) };
        if (severity)
            query.severity = severity;
        if (type)
            query.type = type;
        if (resolved !== undefined)
            query.isResolved = resolved === 'true';
        const alerts = await Alert_1.default.find(query)
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(50);
        return res.status(200).json(alerts);
    }
    catch (error) {
        console.error('Error fetching alerts:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAlerts = getAlerts;
const resolveAlert = async (req, res) => {
    const { alertId } = req.params;
    const userId = req.user?.id;
    const institutionId = req.user?.institutionId;
    try {
        const alert = await Alert_1.default.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(alertId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        }, {
            isResolved: true,
            resolvedBy: new mongoose_1.Types.ObjectId(userId),
            resolvedAt: new Date()
        }, { new: true });
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        return res.status(200).json({
            message: 'Alert resolved successfully',
            alert
        });
    }
    catch (error) {
        console.error('Error resolving alert:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.resolveAlert = resolveAlert;
// Helper function to generate analytics
const generateAnalytics = async (institutionId, startDate, endDate, period) => {
    if (!institutionId) {
        return;
    }
    try {
        // Generate student performance analytics
        const studentPerformance = await (0, analyticsService_1.generateStudentPerformanceAnalytics)(institutionId, startDate, endDate);
        if (studentPerformance) {
            await new Analytics_1.default({
                institutionId: new mongoose_1.Types.ObjectId(institutionId),
                type: 'student_performance',
                data: { studentPerformance },
                period: { startDate, endDate, type: period }
            }).save();
        }
        // Generate attendance analytics
        const attendance = await (0, analyticsService_1.generateAttendanceAnalytics)(institutionId, startDate, endDate);
        if (attendance) {
            await new Analytics_1.default({
                institutionId: new mongoose_1.Types.ObjectId(institutionId),
                type: 'attendance',
                data: { attendance },
                period: { startDate, endDate, type: period }
            }).save();
        }
        // Generate teacher performance analytics
        const teacherPerformance = await (0, analyticsService_1.generateTeacherPerformanceAnalytics)(institutionId, startDate, endDate);
        if (teacherPerformance) {
            await new Analytics_1.default({
                institutionId: new mongoose_1.Types.ObjectId(institutionId),
                type: 'teacher_performance',
                data: { teacherPerformance },
                period: { startDate, endDate, type: period }
            }).save();
        }
    }
    catch (error) {
        console.error('Error generating analytics:', error);
    }
};
