"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StudentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    generatedId: { type: String, required: true, unique: true },
    admissionYear: { type: Number, required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    classroomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    department: { type: String },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    dateOfBirth: { type: Date, required: true },
    guardianInfo: [
        {
            name: String,
            relationship: String,
            phone: String,
            email: String,
        },
    ],
    emergencyContacts: [
        {
            name: String,
            relationship: String,
            phone: String,
        },
    ],
    medicalNotes: { type: String },
    photoUrl: { type: String },
    govtIdNumber: { type: String },
    govtIdImageUrlFront: { type: String },
    govtIdImageUrlBack: { type: String },
    // Enhanced Academic Information
    academic: {
        currentGPA: { type: Number, default: 0 },
        cumulativeGPA: { type: Number, default: 0 },
        currentRank: { type: Number, default: 0 },
        academicStatus: {
            type: String,
            enum: ['excellent', 'good', 'average', 'below_average', 'at_risk'],
            default: 'average'
        },
        reportCards: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ReportCard' }],
    },
    // QR & Digital Features
    qr: {
        qrCodeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'QRCode' },
        idCardId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'IDCard' },
        digitalWalletAdded: { type: Boolean, default: false },
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Student', StudentSchema);
