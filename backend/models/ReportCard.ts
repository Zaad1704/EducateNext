import { Schema, model, Document, Types } from 'mongoose';

export interface IReportCard extends Document {
  studentId: Types.ObjectId;
  institutionId: Types.ObjectId;
  classroomId: Types.ObjectId;
  academicYear: string;
  semester: 'first' | 'second' | 'annual';
  subjects: Array<{
    subjectId: Types.ObjectId;
    teacherId: Types.ObjectId;
    grades: Types.ObjectId[];
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    gpa: number;
    remarks: string;
  }>;
  overallGPA: number;
  overallPercentage: number;
  overallGrade: string;
  rank: number;
  totalStudents: number;
  attendance: {
    totalDays: number;
    presentDays: number;
    percentage: number;
  };
  teacherRemarks: string;
  principalRemarks: string;
  nextTermBegins: Date;
  isPublished: boolean;
  generatedAt: Date;
  template: 'standard' | 'detailed' | 'minimal';
}

const ReportCardSchema = new Schema<IReportCard>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['first', 'second', 'annual'], required: true },
    subjects: [{
      subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
      teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
      grades: [{ type: Schema.Types.ObjectId, ref: 'Grade' }],
      totalMarks: { type: Number, required: true },
      obtainedMarks: { type: Number, required: true },
      percentage: { type: Number, required: true },
      grade: { type: String, required: true },
      gpa: { type: Number, required: true },
      remarks: { type: String, default: '' },
    }],
    overallGPA: { type: Number, required: true },
    overallPercentage: { type: Number, required: true },
    overallGrade: { type: String, required: true },
    rank: { type: Number, required: true },
    totalStudents: { type: Number, required: true },
    attendance: {
      totalDays: { type: Number, required: true },
      presentDays: { type: Number, required: true },
      percentage: { type: Number, required: true },
    },
    teacherRemarks: { type: String, default: '' },
    principalRemarks: { type: String, default: '' },
    nextTermBegins: { type: Date },
    isPublished: { type: Boolean, default: false },
    generatedAt: { type: Date, default: Date.now },
    template: { type: String, enum: ['standard', 'detailed', 'minimal'], default: 'standard' },
  },
  { timestamps: true }
);

ReportCardSchema.index({ studentId: 1, academicYear: 1, semester: 1 }, { unique: true });
ReportCardSchema.index({ institutionId: 1, academicYear: 1 });
ReportCardSchema.index({ classroomId: 1, academicYear: 1 });

export default model<IReportCard>('ReportCard', ReportCardSchema);