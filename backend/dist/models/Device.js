"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DeviceSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    deviceId: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true },
    deviceType: {
        type: String,
        enum: ['teacher_phone', 'principal_device', 'dedicated_scanner'],
        required: true
    },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastUsed: { type: Date, default: Date.now },
    location: { type: String },
}, { timestamps: true });
DeviceSchema.index({ institutionId: 1, deviceId: 1 }, { unique: true });
DeviceSchema.index({ assignedTo: 1 });
exports.default = (0, mongoose_1.model)('Device', DeviceSchema);
