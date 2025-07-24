import { Schema, model, Document, Types } from 'mongoose';

export interface IAlert extends Document {
  institutionId: Types.ObjectId;
  type: 'performance' | 'attendance' | 'financial' | 'system' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: any;
  targetUsers: Types.ObjectId[];
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  expiresAt?: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
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
    data: { type: Schema.Types.Mixed },
    targetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

AlertSchema.index({ institutionId: 1, isResolved: 1, severity: 1 });
AlertSchema.index({ targetUsers: 1, isRead: 1 });

export default model<IAlert>('Alert', AlertSchema);