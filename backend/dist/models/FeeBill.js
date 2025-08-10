"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/models/FeeBill.ts
const mongoose_1 = require("mongoose");
const FeeBillItemSchema = new mongoose_1.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
}, { _id: false }); // Do not generate _id for subdocuments
const FeeBillSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    academicYear: { type: Number, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    issueDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'partially_paid', 'cancelled'],
        default: 'pending',
    },
    items: [FeeBillItemSchema],
    payments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' }],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('FeeBill', FeeBillSchema);
