"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: ['Administrator', 'Teacher', 'Student', 'Accountant', 'Super Admin'],
        required: true,
    },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    photoUrl: { type: String },
    permanentAddress: { type: String },
    govtIdUrl: { type: String },
    qualifications: [{ type: String }],
    certifications: [
        {
            title: String,
            fileUrl: String,
            issueDate: Date,
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('User', UserSchema);
