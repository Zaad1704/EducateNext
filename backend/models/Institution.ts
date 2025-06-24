import { Schema, model, Document, Types } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  owner: Types.ObjectId;
  status: 'active' | 'inactive' | 'pending_deletion';
  branding: {
    companyName: string;
    companyLogoUrl: string;
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
    branding: {
      companyName: { type: String, required: true },
      companyLogoUrl: { type: String },
    },
  },
  { timestamps: true }
);

export default model<IInstitution>('Institution', InstitutionSchema);