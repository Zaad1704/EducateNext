import { Schema, model, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  classroomId: Types.ObjectId;
  institutionId: Types.ObjectId;
  enrollmentDate: Date;
  status: 'active' | 'inactive';
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default model<IEnrollment>('Enrollment', EnrollmentSchema);