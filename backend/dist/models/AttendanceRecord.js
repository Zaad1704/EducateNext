"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AttendanceRecordSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    sessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AttendanceSession' },
    date: { type: Date, required: true },
    scanTime: { type: Date, default: Date.now },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
    scanType: { type: String, enum: ['class_start', 'class_end', 'single'], default: 'single' },
    scanMethod: { type: String, enum: ['qr_scan', 'manual', 'bulk_import'], default: 'manual' },
    deviceId: { type: String },
    isVerified: { type: Boolean, default: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('AttendanceRecord', AttendanceRecordSchema);
