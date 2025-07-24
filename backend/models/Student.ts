import { Schema, model, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  generatedId: string;
  admissionYear: number;
  institutionId: Types.ObjectId;
  classroomId: Types.ObjectId;
  contactEmail: string;
  contactPhone?: string;
  dateOfBirth: Date;
  guardianInfo: { name: string; relationship: string; phone: string; email?: string }[];
  emergencyContacts: { name: string; relationship: string; phone: string }[];
  medicalNotes?: string;
  photoUrl?: string;
  govtIdNumber?: string;
  govtIdImageUrlFront?: string;
  govtIdImageUrlBack?: string;
  
  // Enhanced Academic Information
  academic: {
    currentGPA: number;
    cumulativeGPA: number;
    currentRank: number;
    academicStatus: 'excellent' | 'good' | 'average' | 'below_average' | 'at_risk';
    reportCards: Types.ObjectId[];
  };
  
  // QR & Digital Features
  qr: {
    qrCodeId?: Types.ObjectId;
    idCardId?: Types.ObjectId;
    digitalWalletAdded: boolean;
  };
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    generatedId: { type: String, required: true, unique: true },
    admissionYear: { type: Number, required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    dateOfBirth: { type: Date, required: true },
    guardianInfo: [
      {
        name: String,
        relationship: String,
        phone: String,
        email: String,
      },
    ],
    emergencyContacts: [
      {
        name: String,
        relationship: String,
        phone: String,
      },
    ],
    medicalNotes: { type: String },
    photoUrl: { type: String },
    govtIdNumber: { type: String },
    govtIdImageUrlFront: { type: String },
    govtIdImageUrlBack: { type: String },
    
    // Enhanced Academic Information
    academic: {
      currentGPA: { type: Number, default: 0 },
      cumulativeGPA: { type: Number, default: 0 },
      currentRank: { type: Number, default: 0 },
      academicStatus: { 
        type: String, 
        enum: ['excellent', 'good', 'average', 'below_average', 'at_risk'], 
        default: 'average' 
      },
      reportCards: [{ type: Schema.Types.ObjectId, ref: 'ReportCard' }],
    },
    
    // QR & Digital Features
    qr: {
      qrCodeId: { type: Schema.Types.ObjectId, ref: 'QRCode' },
      idCardId: { type: Schema.Types.ObjectId, ref: 'IDCard' },
      digitalWalletAdded: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default model<IStudent>('Student', StudentSchema);