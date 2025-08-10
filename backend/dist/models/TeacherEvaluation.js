"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TeacherEvaluationSchema = new mongoose_1.Schema({
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    evaluatorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['first', 'second', 'annual'], required: true },
    evaluationType: {
        type: String,
        enum: ['student_feedback', 'peer_review', 'admin_review', 'self_assessment'],
        required: true
    },
    metrics: {
        teachingEffectiveness: { type: Number, min: 1, max: 10, required: true },
        classroomManagement: { type: Number, min: 1, max: 10, required: true },
        studentEngagement: { type: Number, min: 1, max: 10, required: true },
        subjectKnowledge: { type: Number, min: 1, max: 10, required: true },
        communication: { type: Number, min: 1, max: 10, required: true },
        punctuality: { type: Number, min: 1, max: 10, required: true },
        professionalism: { type: Number, min: 1, max: 10, required: true },
        innovation: { type: Number, min: 1, max: 10, required: true },
    },
    studentPerformance: {
        averageClassGPA: { type: Number, default: 0 },
        passRate: { type: Number, default: 0 },
        improvementRate: { type: Number, default: 0 },
        attendanceImpact: { type: Number, default: 0 },
    },
    attendance: {
        totalWorkingDays: { type: Number, default: 0 },
        presentDays: { type: Number, default: 0 },
        lateArrivals: { type: Number, default: 0 },
        earlyDepartures: { type: Number, default: 0 },
        attendancePercentage: { type: Number, default: 0 },
    },
    strengths: [{ type: String }],
    areasForImprovement: [{ type: String }],
    goals: [{ type: String }],
    evaluatorComments: { type: String, default: '' },
    teacherResponse: { type: String },
    overallRating: { type: Number, min: 1, max: 10, required: true },
    recommendation: {
        type: String,
        enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
        required: true
    },
    isFinalized: { type: Boolean, default: false },
    evaluatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
TeacherEvaluationSchema.index({ teacherId: 1, academicYear: 1, semester: 1 });
TeacherEvaluationSchema.index({ institutionId: 1, evaluationType: 1 });
exports.default = (0, mongoose_1.model)('TeacherEvaluation', TeacherEvaluationSchema);
