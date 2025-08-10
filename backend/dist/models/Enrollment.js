"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const EnrollmentSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Enrollment', EnrollmentSchema);
