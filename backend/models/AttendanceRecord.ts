import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendanceRecord extends Document {
  studentId: Types.ObjectId;
  classroomId: Types.ObjectId;
  institutionId: Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  },
  { timestamps: true }
);

export default model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);