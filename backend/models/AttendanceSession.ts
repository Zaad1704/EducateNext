import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendanceSession extends Document {
  classroomId: Types.ObjectId;
  teacherId: Types.ObjectId;
  institutionId: Types.ObjectId;
  sessionType: 'class_start' | 'class_end';
  date: Date;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  attendanceRecords: Types.ObjectId[];
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    sessionType: { type: String, enum: ['class_start', 'class_end'], required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    isActive: { type: Boolean, default: true },
    attendanceRecords: [{ type: Schema.Types.ObjectId, ref: 'AttendanceRecord' }],
  },
  { timestamps: true }
);

AttendanceSessionSchema.index({ classroomId: 1, date: 1, sessionType: 1 });
AttendanceSessionSchema.index({ institutionId: 1, date: 1 });

export default model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);