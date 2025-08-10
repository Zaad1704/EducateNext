"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/models/Payment.ts
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    feeBillId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'FeeBill', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
    receiptUrl: { type: String },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Payment', PaymentSchema);
