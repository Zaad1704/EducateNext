import { Schema, model, Document, Types } from 'mongoose';

export interface IAnalytics extends Document {
  institutionId: Types.ObjectId;
  type: 'student_performance' | 'teacher_performance' | 'attendance' | 'financial' | 'website';
  data: {
    studentPerformance?: {
      averageGPA: number;
      passRate: number;
      improvementRate: number;
      subjectWisePerformance: Array<{
        subjectId: Types.ObjectId;
        averageGrade: number;
        passRate: number;
      }>;
      classWisePerformance: Array<{
        classroomId: Types.ObjectId;
        averageGPA: number;
        totalStudents: number;
      }>;
    };
    teacherPerformance?: {
      averageRating: number;
      totalEvaluations: number;
      topPerformers: Types.ObjectId[];
      improvementNeeded: Types.ObjectId[];
    };
    attendance?: {
      overallRate: number;
      monthlyTrends: Array<{
        month: string;
        rate: number;
      }>;
      classWiseRates: Array<{
        classroomId: Types.ObjectId;
        rate: number;
      }>;
    };
    financial?: {
      totalRevenue: number;
      collectionRate: number;
      pendingFees: number;
      monthlyRevenue: Array<{
        month: string;
        amount: number;
      }>;
    };
    website?: {
      visitors: number;
      pageViews: number;
      bounceRate: number;
      avgSessionDuration: number;
    };
  };
  period: {
    startDate: Date;
    endDate: Date;
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  generatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    type: { 
      type: String, 
      enum: ['student_performance', 'teacher_performance', 'attendance', 'financial', 'website'], 
      required: true 
    },
    data: {
      studentPerformance: {
        averageGPA: { type: Number },
        passRate: { type: Number },
        improvementRate: { type: Number },
        subjectWisePerformance: [{
          subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
          averageGrade: { type: Number },
          passRate: { type: Number }
        }],
        classWisePerformance: [{
          classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom' },
          averageGPA: { type: Number },
          totalStudents: { type: Number }
        }]
      },
      teacherPerformance: {
        averageRating: { type: Number },
        totalEvaluations: { type: Number },
        topPerformers: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],
        improvementNeeded: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }]
      },
      attendance: {
        overallRate: { type: Number },
        monthlyTrends: [{
          month: { type: String },
          rate: { type: Number }
        }],
        classWiseRates: [{
          classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom' },
          rate: { type: Number }
        }]
      },
      financial: {
        totalRevenue: { type: Number },
        collectionRate: { type: Number },
        pendingFees: { type: Number },
        monthlyRevenue: [{
          month: { type: String },
          amount: { type: Number }
        }]
      },
      website: {
        visitors: { type: Number },
        pageViews: { type: Number },
        bounceRate: { type: Number },
        avgSessionDuration: { type: Number }
      }
    },
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      type: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], required: true }
    },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

AnalyticsSchema.index({ institutionId: 1, type: 1, 'period.type': 1 });
AnalyticsSchema.index({ generatedAt: 1 });

export default model<IAnalytics>('Analytics', AnalyticsSchema);