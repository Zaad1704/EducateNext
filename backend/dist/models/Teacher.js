"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TeacherSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    assignedClassroomIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom' }],
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    photoUrl: { type: String },
    qualifications: [{ type: String }],
    bio: { type: String },
    // Performance & Evaluation
    performance: {
        currentRating: { type: Number, default: 0 },
        evaluations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'TeacherEvaluation' }],
        studentFeedbackAverage: { type: Number, default: 0 },
        lastEvaluationDate: { type: Date },
    },
    // QR & Attendance
    qr: {
        qrCodeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'QRCode' },
        idCardId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'IDCard' },
        attendanceDevices: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Device' }],
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Teacher', TeacherSchema);
