"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReportCardSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['first', 'second', 'annual'], required: true },
    subjects: [{
            subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', required: true },
            teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
            grades: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Grade' }],
            totalMarks: { type: Number, required: true },
            obtainedMarks: { type: Number, required: true },
            percentage: { type: Number, required: true },
            grade: { type: String, required: true },
            gpa: { type: Number, required: true },
            remarks: { type: String, default: '' },
        }],
    overallGPA: { type: Number, required: true },
    overallPercentage: { type: Number, required: true },
    overallGrade: { type: String, required: true },
    rank: { type: Number, required: true },
    totalStudents: { type: Number, required: true },
    attendance: {
        totalDays: { type: Number, required: true },
        presentDays: { type: Number, required: true },
        percentage: { type: Number, required: true },
    },
    teacherRemarks: { type: String, default: '' },
    principalRemarks: { type: String, default: '' },
    nextTermBegins: { type: Date },
    isPublished: { type: Boolean, default: false },
    generatedAt: { type: Date, default: Date.now },
    template: { type: String, enum: ['standard', 'detailed', 'minimal'], default: 'standard' },
}, { timestamps: true });
ReportCardSchema.index({ studentId: 1, academicYear: 1, semester: 1 }, { unique: true });
ReportCardSchema.index({ institutionId: 1, academicYear: 1 });
ReportCardSchema.index({ classroomId: 1, academicYear: 1 });
exports.default = (0, mongoose_1.model)('ReportCard', ReportCardSchema);
