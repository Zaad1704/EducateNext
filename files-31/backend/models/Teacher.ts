import { Schema, model, Document, Types } from 'mongoose';

export interface ITeacher extends Document {
  userId: Types.ObjectId;
  employeeId: string;
  assignedClassroomIds: Types.ObjectId[];
}

const TeacherSchema = new Schema<ITeacher>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    assignedClassroomIds: [{ type: Schema.Types.ObjectId, ref: 'Classroom' }],
  },
  { timestamps: true }
);

export default model<ITeacher>('Teacher', TeacherSchema);