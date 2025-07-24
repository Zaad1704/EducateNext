import { Schema, model, Document, Types } from 'mongoose';

export interface IGrade extends Document {
  studentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  subjectId: Types.ObjectId;
  classroomId: Types.ObjectId;
  institutionId: Types.ObjectId;
  academicYear: string;
  semester: 'first' | 'second' | 'annual';
  gradeType: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation';
  title: string;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  date: Date;
  remarks?: string;
  isPublished: boolean;
  weightage: number;
}

const GradeSchema = new Schema<IGrade>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['first', 'second', 'annual'], required: true },
    gradeType: { 
      type: String, 
      enum: ['assignment', 'quiz', 'exam', 'project', 'participation'], 
      required: true 
    },
    title: { type: String, required: true },
    maxMarks: { type: Number, required: true, min: 0 },
    obtainedMarks: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true },
    gpa: { type: Number, required: true, min: 0, max: 4 },
    date: { type: Date, required: true },
    remarks: { type: String },
    isPublished: { type: Boolean, default: false },
    weightage: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true }
);

GradeSchema.index({ studentId: 1, academicYear: 1, semester: 1 });
GradeSchema.index({ teacherId: 1, subjectId: 1 });
GradeSchema.index({ institutionId: 1, academicYear: 1 });

export default model<IGrade>('Grade', GradeSchema);