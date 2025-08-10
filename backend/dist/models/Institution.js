"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const InstitutionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending_deletion'],
        default: 'active',
    },
    type: {
        type: String,
        enum: ['school', 'college', 'university'],
        default: 'school',
    },
    contact: {
        address: { type: String },
        phone: { type: String },
        email: { type: String },
    },
    branding: {
        companyName: { type: String, required: true },
        companyLogoUrl: { type: String },
        primaryColor: { type: String, default: '#3B82F6' },
        secondaryColor: { type: String, default: '#1E40AF' },
    },
    // QR & Attendance settings
    qrSettings: {
        enableQRAttendance: { type: Boolean, default: true },
        dualScanRequired: { type: Boolean, default: false },
        qrExpiryHours: { type: Number, default: 24 },
        allowedDevices: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Device' }],
        principalDevices: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Device' }],
    },
    // Academic Configuration
    academic: {
        gradingSystem: {
            type: String,
            enum: ['gpa', 'percentage', 'both'],
            default: 'both',
        },
        academicYear: {
            startDate: { type: Date },
            endDate: { type: Date },
            current: { type: String },
        },
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Institution', InstitutionSchema);
