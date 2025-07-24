import { Schema, model, Document, Types } from 'mongoose';

export interface ITeacher extends Document {
  userId: Types.ObjectId;
  employeeId: string;
  assignedClassroomIds: Types.ObjectId[];
  
  // Performance & Evaluation
  performance: {
    currentRating: number;
    evaluations: Types.ObjectId[];
    studentFeedbackAverage: number;
    lastEvaluationDate: Date;
  };
  
  // QR & Attendance
  qr: {
    qrCodeId?: Types.ObjectId;
    idCardId?: Types.ObjectId;
    attendanceDevices: Types.ObjectId[];
  };
}

const TeacherSchema = new Schema<ITeacher>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    assignedClassroomIds: [{ type: Schema.Types.ObjectId, ref: 'Classroom' }],
    
    // Performance & Evaluation
    performance: {
      currentRating: { type: Number, default: 0 },
      evaluations: [{ type: Schema.Types.ObjectId, ref: 'TeacherEvaluation' }],
      studentFeedbackAverage: { type: Number, default: 0 },
      lastEvaluationDate: { type: Date },
    },
    
    // QR & Attendance
    qr: {
      qrCodeId: { type: Schema.Types.ObjectId, ref: 'QRCode' },
      idCardId: { type: Schema.Types.ObjectId, ref: 'IDCard' },
      attendanceDevices: [{ type: Schema.Types.ObjectId, ref: 'Device' }],
    },
  },
  { timestamps: true }
);

export default model<ITeacher>('Teacher', TeacherSchema);