// backend/models/Expense.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  institutionId: Types.ObjectId;
  recordedBy: Types.ObjectId; // User ID of who recorded the expense
  date: Date;
  category: string; // e.g., 'Salaries', 'Utilities', 'Supplies', 'Rent'
  amount: number;
  description: string;
  receiptUrl?: string; // Optional: URL to an uploaded receipt document
  status: 'approved' | 'pending' | 'rejected';
}

const ExpenseSchema = new Schema<IExpense>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  },
  { timestamps: true }
);

export default model<IExpense>('Expense', ExpenseSchema);
