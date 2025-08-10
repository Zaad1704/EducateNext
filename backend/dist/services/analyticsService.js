"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlert = exports.generatePredictiveInsights = exports.generateTeacherPerformanceAnalytics = exports.generateAttendanceAnalytics = exports.generateStudentPerformanceAnalytics = void 0;
const Analytics_1 = __importDefault(require("../models/Analytics"));
const Grade_1 = __importDefault(require("../models/Grade"));
const AttendanceRecord_1 = __importDefault(require("../models/AttendanceRecord"));
const TeacherEvaluation_1 = __importDefault(require("../models/TeacherEvaluation"));
const Alert_1 = __importDefault(require("../models/Alert"));
const mongoose_1 = require("mongoose");
const generateStudentPerformanceAnalytics = async (institutionId, startDate, endDate) => {
    try {
        // Get all grades for the period
        const grades = await Grade_1.default.find({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
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
        const subjectPerformance = grades.reduce((acc, grade) => {
            const subjectId = grade.subjectId._id.toString();
            if (!acc[subjectId]) {
                acc[subjectId] = { grades: [], subjectId: grade.subjectId._id };
            }
            acc[subjectId].grades.push(grade);
            return acc;
        }, {});
        const subjectWisePerformance = Object.values(subjectPerformance).map((subject) => ({
            subjectId: subject.subjectId,
            averageGrade: subject.grades.reduce((sum, g) => sum + g.gpa, 0) / subject.grades.length,
            passRate: (subject.grades.filter((g) => g.percentage >= 60).length / subject.grades.length) * 100
        }));
        // Class-wise performance
        const classPerformance = grades.reduce((acc, grade) => {
            const classId = grade.classroomId._id.toString();
            if (!acc[classId]) {
                acc[classId] = { grades: [], classroomId: grade.classroomId._id };
            }
            acc[classId].grades.push(grade);
            return acc;
        }, {});
        const classWisePerformance = Object.values(classPerformance).map((cls) => ({
            classroomId: cls.classroomId,
            averageGPA: cls.grades.reduce((sum, g) => sum + g.gpa, 0) / cls.grades.length,
            totalStudents: new Set(cls.grades.map((g) => g.studentId.toString())).size
        }));
        return {
            averageGPA: Math.round(averageGPA * 100) / 100,
            passRate: Math.round(passRate * 100) / 100,
            improvementRate: Math.random() * 10 + 5, // Placeholder
            subjectWisePerformance,
            classWisePerformance
        };
    }
    catch (error) {
        console.error('Error generating student performance analytics:', error);
        throw error;
    }
};
exports.generateStudentPerformanceAnalytics = generateStudentPerformanceAnalytics;
const generateAttendanceAnalytics = async (institutionId, startDate, endDate) => {
    try {
        const attendanceRecords = await AttendanceRecord_1.default.find({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            date: { $gte: startDate, $lte: endDate }
        }).populate('classroomId');
        if (attendanceRecords.length === 0) {
            return null;
        }
        const totalRecords = attendanceRecords.length;
        const presentRecords = attendanceRecords.filter(record => record.status === 'present').length;
        const overallRate = (presentRecords / totalRecords) * 100;
        // Monthly trends
        const monthlyData = attendanceRecords.reduce((acc, record) => {
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
        const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            rate: Math.round((data.present / data.total) * 100 * 100) / 100
        }));
        // Class-wise rates
        const classData = attendanceRecords.reduce((acc, record) => {
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
        const classWiseRates = Object.values(classData).map((cls) => ({
            classroomId: cls.classroomId,
            rate: Math.round((cls.present / cls.total) * 100 * 100) / 100
        }));
        return {
            overallRate: Math.round(overallRate * 100) / 100,
            monthlyTrends,
            classWiseRates
        };
    }
    catch (error) {
        console.error('Error generating attendance analytics:', error);
        throw error;
    }
};
exports.generateAttendanceAnalytics = generateAttendanceAnalytics;
const generateTeacherPerformanceAnalytics = async (institutionId, startDate, endDate) => {
    try {
        const evaluations = await TeacherEvaluation_1.default.find({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            evaluatedAt: { $gte: startDate, $lte: endDate },
            isFinalized: true
        });
        if (evaluations.length === 0) {
            return null;
        }
        const averageRating = evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluations.length;
        const topPerformers = evaluations
            .filter(evaluation => evaluation.overallRating >= 8)
            .map(evaluation => evaluation.teacherId);
        const improvementNeeded = evaluations
            .filter(evaluation => evaluation.overallRating < 6)
            .map(evaluation => evaluation.teacherId);
        return {
            averageRating: Math.round(averageRating * 100) / 100,
            totalEvaluations: evaluations.length,
            topPerformers,
            improvementNeeded
        };
    }
    catch (error) {
        console.error('Error generating teacher performance analytics:', error);
        throw error;
    }
};
exports.generateTeacherPerformanceAnalytics = generateTeacherPerformanceAnalytics;
const generatePredictiveInsights = async (institutionId) => {
    try {
        // Get recent analytics data
        const recentAnalytics = await Analytics_1.default.find({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
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
    }
    catch (error) {
        console.error('Error generating predictive insights:', error);
        throw error;
    }
};
exports.generatePredictiveInsights = generatePredictiveInsights;
const createAlert = async (institutionId, type, severity, title, message, data, targetUsers) => {
    try {
        const alert = new Alert_1.default({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            type,
            severity,
            title,
            message,
            data,
            targetUsers: targetUsers?.map(id => new mongoose_1.Types.ObjectId(id)) || [],
            isRead: false,
            isResolved: false
        });
        await alert.save();
        return alert;
    }
    catch (error) {
        console.error('Error creating alert:', error);
        throw error;
    }
};
exports.createAlert = createAlert;
