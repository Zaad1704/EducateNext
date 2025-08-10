"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMonitoringSettings = exports.getTeacherPerformanceAnalytics = exports.resolveAlert = exports.markTeacherAttendance = exports.updateDeviceActivity = exports.updateTeacherLocation = exports.getRealTimeTeacherActivity = exports.getTeacherMonitoringData = void 0;
const TeacherMonitoring_1 = __importDefault(require("../models/TeacherMonitoring"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
// Get all teacher monitoring data for an institution
const getTeacherMonitoringData = async (req, res) => {
    try {
        const { institutionId, date, teacherId } = req.query;
        let query = {};
        if (institutionId) {
            query.institutionId = institutionId;
        }
        if (teacherId) {
            query.teacherId = teacherId;
        }
        if (date) {
            const targetDate = new Date(date);
            query.date = {
                $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            };
        }
        const monitoringData = await TeacherMonitoring_1.default.find(query)
            .populate('teacherId', 'userId employeeId')
            .populate('institutionId', 'name')
            .populate('classSchedule.classroomId', 'name')
            .populate('classSchedule.subjectId', 'name')
            .sort({ date: -1 });
        res.json(monitoringData);
    }
    catch (error) {
        console.error('Error fetching teacher monitoring data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTeacherMonitoringData = getTeacherMonitoringData;
// Get real-time teacher activity
const getRealTimeTeacherActivity = async (req, res) => {
    try {
        const { institutionId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monitoringData = await TeacherMonitoring_1.default.find({
            institutionId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        })
            .populate({
            path: 'teacherId',
            populate: {
                path: 'userId',
                select: 'name email'
            }
        })
            .populate('classSchedule.classroomId', 'name')
            .populate('classSchedule.subjectId', 'name');
        // Transform data for frontend consumption
        const teacherActivities = monitoringData.map(data => {
            const teacher = data.teacherId;
            const currentClass = data.classSchedule.find(schedule => {
                const scheduleTime = new Date(schedule.scheduledTime);
                const now = new Date();
                const timeDiff = Math.abs(now.getTime() - scheduleTime.getTime()) / (1000 * 60); // minutes
                return timeDiff <= 30; // Within 30 minutes of scheduled time
            });
            return {
                id: data._id,
                teacherId: teacher._id,
                teacherName: teacher.userId?.name || 'Unknown',
                subject: currentClass ? currentClass.subjectId?.name : 'No class',
                classroom: currentClass ? currentClass.classroomId?.name : 'No class',
                scheduledTime: currentClass?.scheduledTime,
                actualTime: currentClass?.actualArrivalTime,
                status: currentClass?.status || 'no_class',
                location: data.location,
                deviceActivity: data.deviceActivity,
                classActivity: {
                    studentsPresent: 0, // This would be populated from attendance data
                    totalStudents: 0,
                    attendancePercentage: 0,
                    classStarted: currentClass?.actualArrivalTime ? true : false,
                    classEnded: currentClass?.actualDepartureTime ? true : false,
                },
                alerts: data.alerts.filter(alert => !alert.isResolved)
            };
        });
        res.json(teacherActivities);
    }
    catch (error) {
        console.error('Error fetching real-time teacher activity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getRealTimeTeacherActivity = getRealTimeTeacherActivity;
// Update teacher location (called from mobile app)
const updateTeacherLocation = async (req, res) => {
    try {
        const { teacherId, latitude, longitude, address } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let monitoringData = await TeacherMonitoring_1.default.findOne({
            teacherId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        if (!monitoringData) {
            // Create new monitoring record for today
            const teacher = await Teacher_1.default.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            monitoringData = new TeacherMonitoring_1.default({
                teacherId,
                institutionId: teacher.institutionId,
                date: today,
                location: {
                    latitude,
                    longitude,
                    address,
                    isOnCampus: true, // This would be determined by geofencing
                    lastUpdated: new Date()
                }
            });
        }
        else {
            // Update existing record
            monitoringData.location = {
                latitude,
                longitude,
                address,
                isOnCampus: true,
                lastUpdated: new Date()
            };
        }
        await monitoringData.save();
        res.json({ message: 'Location updated successfully' });
    }
    catch (error) {
        console.error('Error updating teacher location:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateTeacherLocation = updateTeacherLocation;
// Update device activity (called from mobile app)
const updateDeviceActivity = async (req, res) => {
    try {
        const { teacherId, isOnline, batteryLevel, screenTime, appUsage } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let monitoringData = await TeacherMonitoring_1.default.findOne({
            teacherId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        if (!monitoringData) {
            const teacher = await Teacher_1.default.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            monitoringData = new TeacherMonitoring_1.default({
                teacherId,
                institutionId: teacher.institutionId,
                date: today,
                deviceActivity: {
                    isOnline,
                    lastActive: new Date(),
                    batteryLevel,
                    screenTime,
                    appUsage: appUsage || []
                }
            });
        }
        else {
            monitoringData.deviceActivity = {
                isOnline,
                lastActive: new Date(),
                batteryLevel,
                screenTime,
                appUsage: appUsage || monitoringData.deviceActivity.appUsage
            };
        }
        // Check for alerts
        const alerts = [];
        // Battery low alert
        if (batteryLevel < 20) {
            alerts.push({
                type: 'battery_low',
                message: `Teacher device battery is low (${batteryLevel}%)`,
                severity: 'medium',
                timestamp: new Date(),
                isResolved: false
            });
        }
        // Non-educational app usage alert
        if (appUsage) {
            const nonEducationalApps = appUsage.filter((app) => !app.isEducational);
            if (nonEducationalApps.length > 0) {
                const totalNonEducationalTime = nonEducationalApps.reduce((sum, app) => sum + app.duration, 0);
                if (totalNonEducationalTime > 30) { // More than 30 minutes
                    alerts.push({
                        type: 'non_educational_app',
                        message: `Teacher using non-educational apps for ${totalNonEducationalTime} minutes`,
                        severity: 'low',
                        timestamp: new Date(),
                        isResolved: false
                    });
                }
            }
        }
        // Device offline alert
        if (!isOnline) {
            alerts.push({
                type: 'device_offline',
                message: 'Teacher device is offline',
                severity: 'high',
                timestamp: new Date(),
                isResolved: false
            });
        }
        monitoringData.alerts.push(...alerts);
        await monitoringData.save();
        res.json({ message: 'Device activity updated successfully' });
    }
    catch (error) {
        console.error('Error updating device activity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateDeviceActivity = updateDeviceActivity;
// Mark teacher attendance for a class
const markTeacherAttendance = async (req, res) => {
    try {
        const { teacherId, classroomId, subjectId, scheduledTime, status, lateMinutes } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let monitoringData = await TeacherMonitoring_1.default.findOne({
            teacherId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        if (!monitoringData) {
            const teacher = await Teacher_1.default.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            monitoringData = new TeacherMonitoring_1.default({
                teacherId,
                institutionId: teacher.institutionId,
                date: today,
                classSchedule: []
            });
        }
        // Add or update class schedule
        const classIndex = monitoringData.classSchedule.findIndex(schedule => schedule.classroomId.toString() === classroomId &&
            new Date(schedule.scheduledTime).getTime() === new Date(scheduledTime).getTime());
        const classData = {
            scheduledTime: new Date(scheduledTime),
            actualArrivalTime: status === 'present' || status === 'late' ? new Date() : undefined,
            status,
            lateMinutes: status === 'late' ? lateMinutes : undefined,
            classroomId,
            subjectId
        };
        if (classIndex >= 0) {
            monitoringData.classSchedule[classIndex] = classData;
        }
        else {
            monitoringData.classSchedule.push(classData);
        }
        // Add alert for late arrival
        if (status === 'late' && lateMinutes > 10) {
            monitoringData.alerts.push({
                type: 'late_arrival',
                message: `Teacher arrived ${lateMinutes} minutes late for class`,
                severity: 'medium',
                timestamp: new Date(),
                isResolved: false
            });
        }
        // Add alert for absence
        if (status === 'absent') {
            monitoringData.alerts.push({
                type: 'absent',
                message: 'Teacher absent for scheduled class',
                severity: 'high',
                timestamp: new Date(),
                isResolved: false
            });
        }
        await monitoringData.save();
        res.json({ message: 'Attendance marked successfully' });
    }
    catch (error) {
        console.error('Error marking teacher attendance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.markTeacherAttendance = markTeacherAttendance;
// Resolve alerts
const resolveAlert = async (req, res) => {
    try {
        const { monitoringId, alertIndex, resolvedBy } = req.body;
        const monitoringData = await TeacherMonitoring_1.default.findById(monitoringId);
        if (!monitoringData) {
            return res.status(404).json({ message: 'Monitoring data not found' });
        }
        if (monitoringData.alerts[alertIndex]) {
            monitoringData.alerts[alertIndex].isResolved = true;
            monitoringData.alerts[alertIndex].resolvedAt = new Date();
            monitoringData.alerts[alertIndex].resolvedBy = resolvedBy;
        }
        await monitoringData.save();
        res.json({ message: 'Alert resolved successfully' });
    }
    catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.resolveAlert = resolveAlert;
// Get teacher performance analytics
const getTeacherPerformanceAnalytics = async (req, res) => {
    try {
        const { teacherId, startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const end = endDate ? new Date(endDate) : new Date();
        const query = {
            date: { $gte: start, $lte: end }
        };
        if (teacherId) {
            query.teacherId = teacherId;
        }
        const monitoringData = await TeacherMonitoring_1.default.find(query)
            .populate('teacherId', 'userId employeeId')
            .sort({ date: 1 });
        // Calculate analytics
        const analytics = {
            totalDays: monitoringData.length,
            averagePunctualityScore: 0,
            averageAttendanceRate: 0,
            averageDeviceCompliance: 0,
            averageOverallScore: 0,
            totalAlerts: 0,
            resolvedAlerts: 0,
            alertTypes: {},
            dailyScores: []
        };
        if (monitoringData.length > 0) {
            const totalPunctuality = monitoringData.reduce((sum, data) => sum + data.performanceMetrics.punctualityScore, 0);
            const totalAttendance = monitoringData.reduce((sum, data) => sum + data.performanceMetrics.attendanceRate, 0);
            const totalDeviceCompliance = monitoringData.reduce((sum, data) => sum + data.performanceMetrics.deviceCompliance, 0);
            const totalOverallScore = monitoringData.reduce((sum, data) => sum + data.performanceMetrics.overallScore, 0);
            analytics.averagePunctualityScore = totalPunctuality / monitoringData.length;
            analytics.averageAttendanceRate = totalAttendance / monitoringData.length;
            analytics.averageDeviceCompliance = totalDeviceCompliance / monitoringData.length;
            analytics.averageOverallScore = totalOverallScore / monitoringData.length;
            // Count alerts
            monitoringData.forEach(data => {
                analytics.totalAlerts += data.alerts.length;
                analytics.resolvedAlerts += data.alerts.filter(alert => alert.isResolved).length;
                data.alerts.forEach(alert => {
                    analytics.alertTypes[alert.type] = (analytics.alertTypes[alert.type] || 0) + 1;
                });
            });
            // Daily scores
            analytics.dailyScores = monitoringData.map(data => ({
                date: data.date,
                punctualityScore: data.performanceMetrics.punctualityScore,
                attendanceRate: data.performanceMetrics.attendanceRate,
                deviceCompliance: data.performanceMetrics.deviceCompliance,
                overallScore: data.performanceMetrics.overallScore
            }));
        }
        res.json(analytics);
    }
    catch (error) {
        console.error('Error fetching teacher performance analytics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTeacherPerformanceAnalytics = getTeacherPerformanceAnalytics;
// Update monitoring settings
const updateMonitoringSettings = async (req, res) => {
    try {
        const { teacherId, monitoringSettings, privacyCompliance } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let monitoringData = await TeacherMonitoring_1.default.findOne({
            teacherId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        if (!monitoringData) {
            const teacher = await Teacher_1.default.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            monitoringData = new TeacherMonitoring_1.default({
                teacherId,
                institutionId: teacher.institutionId,
                date: today
            });
        }
        if (monitoringSettings) {
            monitoringData.monitoringSettings = { ...monitoringData.monitoringSettings, ...monitoringSettings };
        }
        if (privacyCompliance) {
            monitoringData.privacyCompliance = { ...monitoringData.privacyCompliance, ...privacyCompliance };
        }
        await monitoringData.save();
        res.json({ message: 'Monitoring settings updated successfully' });
    }
    catch (error) {
        console.error('Error updating monitoring settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateMonitoringSettings = updateMonitoringSettings;
