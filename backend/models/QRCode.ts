import { Schema, model, Document, Types } from 'mongoose';

export interface IQRCode extends Document {
  userId: Types.ObjectId;
  userType: 'student' | 'teacher';
  institutionId: Types.ObjectId;
  qrData: string;
  isActive: boolean;
  generatedAt: Date;
  expiresAt?: Date;
  regenerationCount: number;
}

const QRCodeSchema = new Schema<IQRCode>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['student', 'teacher'], required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    qrData: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    regenerationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

QRCodeSchema.index({ userId: 1, userType: 1 }, { unique: true });
QRCodeSchema.index({ qrData: 1 });
QRCodeSchema.index({ institutionId: 1 });

export default model<IQRCode>('QRCode', QRCodeSchema);