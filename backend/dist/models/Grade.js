"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GradeSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', required: true },
    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['first', 'second', 'annual'], required: true },
    gradeType: {
        type: String,
        enum: ['assignment', 'quiz', 'exam', 'project', 'participation'],
        required: true
    },
    title: { type: String, required: true },
    maxMarks: { type: Number, required: true, min: 0 },
    obtainedMarks: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true },
    gpa: { type: Number, required: true, min: 0, max: 4 },
    date: { type: Date, required: true },
    remarks: { type: String },
    isPublished: { type: Boolean, default: false },
    weightage: { type: Number, default: 1, min: 0 },
}, { timestamps: true });
GradeSchema.index({ studentId: 1, academicYear: 1, semester: 1 });
GradeSchema.index({ teacherId: 1, subjectId: 1 });
GradeSchema.index({ institutionId: 1, academicYear: 1 });
exports.default = (0, mongoose_1.model)('Grade', GradeSchema);
