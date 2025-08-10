// backend/models/Payment.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  feeBillId: Types.ObjectId;
  studentId: Types.ObjectId; // Denormalized for easier lookup
  institutionId: Types.ObjectId; // Denormalized for easier lookup
  amountPaid: number;
  paymentDate: Date;
  paymentMethod: string; // e.g., 'Cash', 'Bank Transfer', 'Online Gateway'
  transactionId?: string; // Optional: ID from payment gateway
  receiptUrl?: string; // Optional: URL to an uploaded receipt document
}

const PaymentSchema = new Schema<IPayment>(
  {
    feeBillId: { type: Schema.Types.ObjectId, ref: 'FeeBill', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

export default model<IPayment>('Payment', PaymentSchema);
