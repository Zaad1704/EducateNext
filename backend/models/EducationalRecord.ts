import mongoose, { Schema, Document } from 'mongoose';

export interface IEducationalRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  recordType: 'academic' | 'disciplinary' | 'health' | 'financial';
  data: any;
  accessLevel: 'public' | 'restricted' | 'confidential';
  parentConsent: boolean;
  studentConsent?: boolean;
  accessLog: Array<{
    userId: mongoose.Types.ObjectId;
    accessedAt: Date;
    purpose: string;
    ipAddress: string;
  }>;
}

const EducationalRecordSchema = new Schema<IEducationalRecord>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  recordType: { 
    type: String, 
    enum: ['academic', 'disciplinary', 'health', 'financial'],
    required: true 
  },
  data: { type: Schema.Types.Mixed, required: true },
  accessLevel: { 
    type: String, 
    enum: ['public', 'restricted', 'confidential'],
    default: 'restricted' 
  },
  parentConsent: { type: Boolean, default: false },
  studentConsent: { type: Boolean },
  accessLog: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accessedAt: { type: Date, default: Date.now },
    purpose: { type: String, required: true },
    ipAddress: { type: String, required: true }
  }]
}, { timestamps: true });

EducationalRecordSchema.index({ studentId: 1, recordType: 1 });
EducationalRecordSchema.index({ institutionId: 1, accessLevel: 1 });

export default mongoose.model<IEducationalRecord>('EducationalRecord', EducationalRecordSchema);