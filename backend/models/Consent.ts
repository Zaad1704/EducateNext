import mongoose, { Schema, Document } from 'mongoose';

export interface IConsent extends Document {
  userId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  consentType: 'data_processing' | 'marketing' | 'analytics' | 'third_party';
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
}

const ConsentSchema = new Schema<IConsent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  consentType: { 
    type: String, 
    enum: ['data_processing', 'marketing', 'analytics', 'third_party'],
    required: true 
  },
  granted: { type: Boolean, required: true },
  grantedAt: { type: Date },
  revokedAt: { type: Date },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  version: { type: String, required: true, default: '1.0' }
}, { timestamps: true });

ConsentSchema.index({ userId: 1, consentType: 1 });
ConsentSchema.index({ institutionId: 1, consentType: 1 });

export default mongoose.model<IConsent>('Consent', ConsentSchema);