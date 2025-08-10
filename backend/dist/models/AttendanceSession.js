"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AttendanceSessionSchema = new mongoose_1.Schema({
    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    sessionType: { type: String, enum: ['class_start', 'class_end'], required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    isActive: { type: Boolean, default: true },
    attendanceRecords: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'AttendanceRecord' }],
}, { timestamps: true });
AttendanceSessionSchema.index({ classroomId: 1, date: 1, sessionType: 1 });
AttendanceSessionSchema.index({ institutionId: 1, date: 1 });
exports.default = (0, mongoose_1.model)('AttendanceSession', AttendanceSessionSchema);
