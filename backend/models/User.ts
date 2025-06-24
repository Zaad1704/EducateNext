import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Administrator' | 'Teacher' | 'Student' | 'Accountant' | 'Super Admin';
  institutionId: Types.ObjectId;
  status: 'active' | 'suspended';
  photoUrl?: string;
  permanentAddress?: string;
  govtIdUrl?: string;
  qualifications?: string[];
  certifications?: { title: string; fileUrl: string; issueDate: Date }[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['Administrator', 'Teacher', 'Student', 'Accountant', 'Super Admin'],
      required: true,
    },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    photoUrl: { type: String },
    permanentAddress: { type: String },
    govtIdUrl: { type: String },
    qualifications: [{ type: String }],
    certifications: [
      {
        title: String,
        fileUrl: String,
        issueDate: Date,
      },
    ],
  },
  { timestamps: true }
);

export default model<IUser>('User', UserSchema);