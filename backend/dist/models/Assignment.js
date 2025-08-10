"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AssignmentSchema = new mongoose_1.Schema({
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', required: true },
    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['homework', 'project', 'quiz', 'exam'],
        required: true
    },
    maxMarks: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    instructions: { type: String, default: '' },
    attachments: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    submissions: [{
            studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
            submittedAt: { type: Date, default: Date.now },
            attachments: [{ type: String }],
            status: {
                type: String,
                enum: ['submitted', 'late', 'pending'],
                default: 'pending'
            },
            gradeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Grade' },
        }],
}, { timestamps: true });
AssignmentSchema.index({ teacherId: 1, classroomId: 1 });
AssignmentSchema.index({ institutionId: 1, dueDate: 1 });
exports.default = (0, mongoose_1.model)('Assignment', AssignmentSchema);
