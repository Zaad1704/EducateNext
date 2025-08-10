import mongoose, { Schema, Document } from 'mongoose';

export interface IDataRequest extends Document {
  userId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  requestType: 'export' | 'delete' | 'rectification';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  data?: any;
  reason?: string;
}

const DataRequestSchema = new Schema<IDataRequest>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  requestType: { 
    type: String, 
    enum: ['export', 'delete', 'rectification'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending' 
  },
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  data: { type: Schema.Types.Mixed },
  reason: { type: String }
}, { timestamps: true });

DataRequestSchema.index({ userId: 1, status: 1 });
DataRequestSchema.index({ institutionId: 1, requestType: 1 });

export default mongoose.model<IDataRequest>('DataRequest', DataRequestSchema);