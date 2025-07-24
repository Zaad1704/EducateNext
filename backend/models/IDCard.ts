import { Schema, model, Document, Types } from 'mongoose';

export interface IIDCard extends Document {
  userId: Types.ObjectId;
  userType: 'student' | 'teacher';
  institutionId: Types.ObjectId;
  cardNumber: string;
  qrCodeId: Types.ObjectId;
  template: 'student' | 'teacher' | 'staff';
  cardData: {
    name: string;
    photo: string;
    id: string;
    institution: string;
    validFrom: Date;
    validUntil: Date;
    emergencyContact?: string;
    department?: string;
    class?: string;
  };
  printStatus: 'pending' | 'printed' | 'delivered';
  digitalWalletAdded: boolean;
  createdAt: Date;
}

const IDCardSchema = new Schema<IIDCard>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['student', 'teacher'], required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    cardNumber: { type: String, required: true, unique: true },
    qrCodeId: { type: Schema.Types.ObjectId, ref: 'QRCode', required: true },
    template: { type: String, enum: ['student', 'teacher', 'staff'], required: true },
    cardData: {
      name: { type: String, required: true },
      photo: { type: String, required: true },
      id: { type: String, required: true },
      institution: { type: String, required: true },
      validFrom: { type: Date, required: true },
      validUntil: { type: Date, required: true },
      emergencyContact: { type: String },
      department: { type: String },
      class: { type: String },
    },
    printStatus: { type: String, enum: ['pending', 'printed', 'delivered'], default: 'pending' },
    digitalWalletAdded: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

IDCardSchema.index({ userId: 1, userType: 1 }, { unique: true });
IDCardSchema.index({ institutionId: 1, cardNumber: 1 });

export default model<IIDCard>('IDCard', IDCardSchema);