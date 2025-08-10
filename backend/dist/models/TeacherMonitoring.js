"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TeacherMonitoringSchema = new mongoose_1.Schema({
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    date: { type: Date, required: true, default: Date.now },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
        isOnCampus: { type: Boolean, default: false },
        lastUpdated: { type: Date, default: Date.now },
    },
    deviceActivity: {
        isOnline: { type: Boolean, default: false },
        lastActive: { type: Date, default: Date.now },
        batteryLevel: { type: Number, min: 0, max: 100 },
        screenTime: { type: Number, default: 0 },
        appUsage: [{
                appName: { type: String },
                duration: { type: Number, default: 0 },
                isEducational: { type: Boolean, default: true },
                timestamp: { type: Date, default: Date.now },
            }],
    },
    classSchedule: [{
            scheduledTime: { type: Date, required: true },
            actualArrivalTime: { type: Date },
            actualDepartureTime: { type: Date },
            status: {
                type: String,
                enum: ['present', 'late', 'absent', 'on_leave'],
                default: 'absent'
            },
            lateMinutes: { type: Number },
            classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom' },
            subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject' },
        }],
    monitoringSettings: {
        isEnabled: { type: Boolean, default: true },
        monitoringHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '17:00' },
        },
        daysOfWeek: { type: [Number], default: [1, 2, 3, 4, 5] }, // Monday to Friday
        geofenceRadius: { type: Number, default: 500 }, // 500 meters
        privacyLevel: {
            type: String,
            enum: ['basic', 'standard', 'comprehensive'],
            default: 'standard'
        },
    },
    alerts: [{
            type: {
                type: String,
                enum: ['late_arrival', 'absent', 'device_offline', 'non_educational_app', 'location_mismatch', 'battery_low'],
                required: true
            },
            message: { type: String, required: true },
            severity: {
                type: String,
                enum: ['low', 'medium', 'high'],
                default: 'medium'
            },
            timestamp: { type: Date, default: Date.now },
            isResolved: { type: Boolean, default: false },
            resolvedAt: { type: Date },
            resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        }],
    privacyCompliance: {
        consentGiven: { type: Boolean, default: false },
        consentDate: { type: Date },
        lastPrivacyNotice: { type: Date },
        dataRetentionDays: { type: Number, default: 90 },
        canOptOut: { type: Boolean, default: true },
        optOutPeriods: [{
                startDate: { type: Date },
                endDate: { type: Date },
                reason: { type: String },
            }],
    },
    performanceMetrics: {
        punctualityScore: { type: Number, min: 0, max: 100, default: 0 },
        attendanceRate: { type: Number, min: 0, max: 100, default: 0 },
        deviceCompliance: { type: Number, min: 0, max: 100, default: 0 },
        overallScore: { type: Number, min: 0, max: 100, default: 0 },
        lastCalculated: { type: Date, default: Date.now },
    },
}, { timestamps: true });
// Pre-save middleware to calculate performance metrics
TeacherMonitoringSchema.pre('save', function (next) {
    if (this.isModified('classSchedule') || this.isModified('deviceActivity')) {
        // Calculate metrics inline instead of calling method
        const today = this.classSchedule.filter((schedule) => {
            const scheduleDate = new Date(schedule.scheduledTime);
            const todayDate = new Date(this.date);
            return scheduleDate.toDateString() === todayDate.toDateString();
        });
        // Calculate punctuality score
        const onTimeClasses = today.filter((schedule) => schedule.status === 'present' && (!schedule.lateMinutes || schedule.lateMinutes <= 5)).length;
        const totalClasses = today.length;
        this.performanceMetrics.punctualityScore = totalClasses > 0 ? (onTimeClasses / totalClasses) * 100 : 0;
        // Calculate attendance rate
        const presentClasses = today.filter((schedule) => schedule.status === 'present').length;
        this.performanceMetrics.attendanceRate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
        // Calculate device compliance
        const totalAppTime = this.deviceActivity.appUsage.reduce((sum, app) => sum + app.duration, 0);
        const educationalAppTime = this.deviceActivity.appUsage
            .filter((app) => app.isEducational)
            .reduce((sum, app) => sum + app.duration, 0);
        this.performanceMetrics.deviceCompliance = totalAppTime > 0 ? (educationalAppTime / totalAppTime) * 100 : 0;
        // Calculate overall score
        this.performanceMetrics.overallScore = (this.performanceMetrics.punctualityScore * 0.4 +
            this.performanceMetrics.attendanceRate * 0.4 +
            this.performanceMetrics.deviceCompliance * 0.2);
        this.performanceMetrics.lastCalculated = new Date();
    }
    next();
});
exports.default = (0, mongoose_1.model)('TeacherMonitoring', TeacherMonitoringSchema);
