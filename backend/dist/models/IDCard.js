"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const IDCardSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['student', 'teacher'], required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    cardNumber: { type: String, required: true, unique: true },
    qrCodeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'QRCode', required: true },
    template: { type: String, enum: ['student', 'teacher', 'staff'], required: true },
    cardData: {
        name: { type: String, required: true },
        photo: { type: String, required: true },
        id: { type: String, required: true },
        institution: { type: String, required: true },
        validFrom: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        emergencyContact: { type: String },
        department: { type: String },
        class: { type: String },
    },
    printStatus: { type: String, enum: ['pending', 'printed', 'delivered'], default: 'pending' },
    digitalWalletAdded: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
IDCardSchema.index({ userId: 1, userType: 1 }, { unique: true });
IDCardSchema.index({ institutionId: 1, cardNumber: 1 });
exports.default = (0, mongoose_1.model)('IDCard', IDCardSchema);
