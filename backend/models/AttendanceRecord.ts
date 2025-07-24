import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendanceRecord extends Document {
  studentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  classroomId: Types.ObjectId;
  institutionId: Types.ObjectId;
  sessionId?: Types.ObjectId;
  date: Date;
  scanTime: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  scanType: 'class_start' | 'class_end' | 'single';
  scanMethod: 'qr_scan' | 'manual' | 'bulk_import';
  deviceId?: string;
  isVerified: boolean;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'AttendanceSession' },
    date: { type: Date, required: true },
    scanTime: { type: Date, default: Date.now },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
    scanType: { type: String, enum: ['class_start', 'class_end', 'single'], default: 'single' },
    scanMethod: { type: String, enum: ['qr_scan', 'manual', 'bulk_import'], default: 'manual' },
    deviceId: { type: String },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);