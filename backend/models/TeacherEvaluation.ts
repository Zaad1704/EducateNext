import { Schema, model, Document, Types } from 'mongoose';

export interface ITeacherEvaluation extends Document {
  teacherId: Types.ObjectId;
  evaluatorId: Types.ObjectId;
  institutionId: Types.ObjectId;
  academicYear: string;
  semester: 'first' | 'second' | 'annual';
  evaluationType: 'student_feedback' | 'peer_review' | 'admin_review' | 'self_assessment';
  
  metrics: {
    teachingEffectiveness: number;
    classroomManagement: number;
    studentEngagement: number;
    subjectKnowledge: number;
    communication: number;
    punctuality: number;
    professionalism: number;
    innovation: number;
  };
  
  studentPerformance: {
    averageClassGPA: number;
    passRate: number;
    improvementRate: number;
    attendanceImpact: number;
  };
  
  attendance: {
    totalWorkingDays: number;
    presentDays: number;
    lateArrivals: number;
    earlyDepartures: number;
    attendancePercentage: number;
  };
  
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  evaluatorComments: string;
  teacherResponse?: string;
  
  overallRating: number;
  recommendation: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  
  isFinalized: boolean;
  evaluatedAt: Date;
}

const TeacherEvaluationSchema = new Schema<ITeacherEvaluation>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    evaluatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['first', 'second', 'annual'], required: true },
    evaluationType: { 
      type: String, 
      enum: ['student_feedback', 'peer_review', 'admin_review', 'self_assessment'], 
      required: true 
    },
    
    metrics: {
      teachingEffectiveness: { type: Number, min: 1, max: 10, required: true },
      classroomManagement: { type: Number, min: 1, max: 10, required: true },
      studentEngagement: { type: Number, min: 1, max: 10, required: true },
      subjectKnowledge: { type: Number, min: 1, max: 10, required: true },
      communication: { type: Number, min: 1, max: 10, required: true },
      punctuality: { type: Number, min: 1, max: 10, required: true },
      professionalism: { type: Number, min: 1, max: 10, required: true },
      innovation: { type: Number, min: 1, max: 10, required: true },
    },
    
    studentPerformance: {
      averageClassGPA: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
      improvementRate: { type: Number, default: 0 },
      attendanceImpact: { type: Number, default: 0 },
    },
    
    attendance: {
      totalWorkingDays: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
      lateArrivals: { type: Number, default: 0 },
      earlyDepartures: { type: Number, default: 0 },
      attendancePercentage: { type: Number, default: 0 },
    },
    
    strengths: [{ type: String }],
    areasForImprovement: [{ type: String }],
    goals: [{ type: String }],
    evaluatorComments: { type: String, default: '' },
    teacherResponse: { type: String },
    
    overallRating: { type: Number, min: 1, max: 10, required: true },
    recommendation: { 
      type: String, 
      enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'], 
      required: true 
    },
    
    isFinalized: { type: Boolean, default: false },
    evaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TeacherEvaluationSchema.index({ teacherId: 1, academicYear: 1, semester: 1 });
TeacherEvaluationSchema.index({ institutionId: 1, evaluationType: 1 });

export default model<ITeacherEvaluation>('TeacherEvaluation', TeacherEvaluationSchema);