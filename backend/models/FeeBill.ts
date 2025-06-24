// backend/models/FeeBill.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IFeeBillItem {
  description: string;
  amount: number;
}

export interface IFeeBill extends Document {
  studentId: Types.ObjectId;
  institutionId: Types.ObjectId;
  academicYear: number;
  amount: number; // Total amount due for this bill
  dueDate: Date;
  issueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid' | 'cancelled';
  items: IFeeBillItem[];
  payments: Types.ObjectId[]; // References to Payment records
}

const FeeBillItemSchema = new Schema<IFeeBillItem>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
}, { _id: false }); // Do not generate _id for subdocuments

const FeeBillSchema = new Schema<IFeeBill>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
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
    payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  },
  { timestamps: true }
);

export default model<IFeeBill>('FeeBill', FeeBillSchema);
