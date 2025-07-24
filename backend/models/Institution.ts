import { Schema, model, Document, Types } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  owner: Types.ObjectId;
  status: 'active' | 'inactive' | 'pending_deletion';
  type: 'school' | 'college' | 'university';
  
  branding: {
    companyName: string;
    companyLogoUrl: string;
    primaryColor: string;
    secondaryColor: string;
  };
  
  // QR & Attendance settings
  qrSettings: {
    enableQRAttendance: boolean;
    dualScanRequired: boolean;
    qrExpiryHours: number;
    allowedDevices: Types.ObjectId[];
    principalDevices: Types.ObjectId[];
  };
  
  // Academic Configuration
  academic: {
    gradingSystem: 'gpa' | 'percentage' | 'both';
    academicYear: {
      startDate: Date;
      endDate: Date;
      current: string;
    };
  };
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_deletion'],
      default: 'active',
    },
    type: {
      type: String,
      enum: ['school', 'college', 'university'],
      default: 'school',
    },
    branding: {
      companyName: { type: String, required: true },
      companyLogoUrl: { type: String },
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#1E40AF' },
    },
    
    // QR & Attendance settings
    qrSettings: {
      enableQRAttendance: { type: Boolean, default: true },
      dualScanRequired: { type: Boolean, default: false },
      qrExpiryHours: { type: Number, default: 24 },
      allowedDevices: [{ type: Schema.Types.ObjectId, ref: 'Device' }],
      principalDevices: [{ type: Schema.Types.ObjectId, ref: 'Device' }],
    },
    
    // Academic Configuration
    academic: {
      gradingSystem: {
        type: String,
        enum: ['gpa', 'percentage', 'both'],
        default: 'both',
      },
      academicYear: {
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: String },
      },
    },
  },
  { timestamps: true }
);

export default model<IInstitution>('Institution', InstitutionSchema);