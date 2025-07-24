import { Schema, model, Document, Types } from 'mongoose';

export interface IDevice extends Document {
  institutionId: Types.ObjectId;
  deviceId: string;
  deviceName: string;
  deviceType: 'teacher_phone' | 'principal_device' | 'dedicated_scanner';
  assignedTo?: Types.ObjectId;
  permissions: string[];
  isActive: boolean;
  lastUsed: Date;
  location?: string;
}

const DeviceSchema = new Schema<IDevice>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    deviceId: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true },
    deviceType: { 
      type: String, 
      enum: ['teacher_phone', 'principal_device', 'dedicated_scanner'], 
      required: true 
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastUsed: { type: Date, default: Date.now },
    location: { type: String },
  },
  { timestamps: true }
);

DeviceSchema.index({ institutionId: 1, deviceId: 1 }, { unique: true });
DeviceSchema.index({ assignedTo: 1 });

export default model<IDevice>('Device', DeviceSchema);