"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AnalyticsSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    type: {
        type: String,
        enum: ['student_performance', 'teacher_performance', 'attendance', 'financial', 'website'],
        required: true
    },
    data: {
        studentPerformance: {
            averageGPA: { type: Number },
            passRate: { type: Number },
            improvementRate: { type: Number },
            subjectWisePerformance: [{
                    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject' },
                    averageGrade: { type: Number },
                    passRate: { type: Number }
                }],
            classWisePerformance: [{
                    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom' },
                    averageGPA: { type: Number },
                    totalStudents: { type: Number }
                }]
        },
        teacherPerformance: {
            averageRating: { type: Number },
            totalEvaluations: { type: Number },
            topPerformers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher' }],
            improvementNeeded: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher' }]
        },
        attendance: {
            overallRate: { type: Number },
            monthlyTrends: [{
                    month: { type: String },
                    rate: { type: Number }
                }],
            classWiseRates: [{
                    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom' },
                    rate: { type: Number }
                }]
        },
        financial: {
            totalRevenue: { type: Number },
            collectionRate: { type: Number },
            pendingFees: { type: Number },
            monthlyRevenue: [{
                    month: { type: String },
                    amount: { type: Number }
                }]
        },
        website: {
            visitors: { type: Number },
            pageViews: { type: Number },
            bounceRate: { type: Number },
            avgSessionDuration: { type: Number }
        }
    },
    period: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        type: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], required: true }
    },
    generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
AnalyticsSchema.index({ institutionId: 1, type: 1, 'period.type': 1 });
AnalyticsSchema.index({ generatedAt: 1 });
exports.default = (0, mongoose_1.model)('Analytics', AnalyticsSchema);
