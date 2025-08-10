"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/models/Expense.ts
const mongoose_1 = require("mongoose");
const ExpenseSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    receiptUrl: { type: String },
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending', // Or 'approved' depending on workflow
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Expense', ExpenseSchema);
