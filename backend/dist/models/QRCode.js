"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QRCodeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['student', 'teacher'], required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    qrData: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    regenerationCount: { type: Number, default: 0 },
}, { timestamps: true });
QRCodeSchema.index({ userId: 1, userType: 1 }, { unique: true });
QRCodeSchema.index({ qrData: 1 });
QRCodeSchema.index({ institutionId: 1 });
exports.default = (0, mongoose_1.model)('QRCode', QRCodeSchema);
