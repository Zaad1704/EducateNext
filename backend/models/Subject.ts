import { Schema, model, Document, Types } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  institutionId: Types.ObjectId;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  },
  { timestamps: true }
);

export default model<ISubject>('Subject', SubjectSchema);