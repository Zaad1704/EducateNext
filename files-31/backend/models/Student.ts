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
  },
  { timestamps: true }
);

export default model<IStudent>('Student', StudentSchema);