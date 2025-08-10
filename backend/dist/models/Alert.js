"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AlertSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    type: {
        type: String,
        enum: ['performance', 'attendance', 'financial', 'system', 'security'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose_1.Schema.Types.Mixed },
    targetUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    expiresAt: { type: Date }
}, { timestamps: true });
AlertSchema.index({ institutionId: 1, isResolved: 1, severity: 1 });
AlertSchema.index({ targetUsers: 1, isRead: 1 });
exports.default = (0, mongoose_1.model)('Alert', AlertSchema);
