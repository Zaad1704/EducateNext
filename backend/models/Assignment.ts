import { Schema, model, Document, Types } from 'mongoose';

export interface IAssignment extends Document {
  teacherId: Types.ObjectId;
  subjectId: Types.ObjectId;
  classroomId: Types.ObjectId;
  institutionId: Types.ObjectId;
  title: string;
  description: string;
  type: 'homework' | 'project' | 'quiz' | 'exam';
  maxMarks: number;
  dueDate: Date;
  instructions: string;
  attachments: string[];
  isPublished: boolean;
  submissions: Array<{
    studentId: Types.ObjectId;
    submittedAt: Date;
    attachments: string[];
    status: 'submitted' | 'late' | 'pending';
    gradeId?: Types.ObjectId;
  }>;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['homework', 'project', 'quiz', 'exam'], 
      required: true 
    },
    maxMarks: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    instructions: { type: String, default: '' },
    attachments: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    submissions: [{
      studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
      submittedAt: { type: Date, default: Date.now },
      attachments: [{ type: String }],
      status: { 
        type: String, 
        enum: ['submitted', 'late', 'pending'], 
        default: 'pending' 
      },
      gradeId: { type: Schema.Types.ObjectId, ref: 'Grade' },
    }],
  },
  { timestamps: true }
);

AssignmentSchema.index({ teacherId: 1, classroomId: 1 });
AssignmentSchema.index({ institutionId: 1, dueDate: 1 });

export default model<IAssignment>('Assignment', AssignmentSchema);