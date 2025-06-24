import { Schema, model, Document, Types } from 'mongoose';

export interface IClassroom extends Document {
  name: string;
  institutionId: Types.ObjectId;
  primaryTeacherId: Types.ObjectId;
  capacity: number;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    name: { type: String, required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    primaryTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    capacity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model<IClassroom>('Classroom', ClassroomSchema);