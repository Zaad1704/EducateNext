// backend/server.ts
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

import authRoutes from './routes/authRoutes';
import institutionRoutes from './routes/institutionRoutes';
import userRoutes from './routes/userRoutes';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import classroomRoutes from './routes/classroomRoutes';
import subjectRoutes from './routes/subjectRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import feeRoutes from './routes/feeRoutes';
import paymentRoutes from './routes/paymentRoutes';
import expenseRoutes from './routes/expenseRoutes';
import qrRoutes from './routes/qrRoutes';
import gradeRoutes from './routes/gradeRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import reportCardRoutes from './routes/reportCardRoutes';
import evaluationRoutes from './routes/evaluationRoutes';
import idCardRoutes from './routes/idCardRoutes';
import attendanceSessionRoutes from './routes/attendanceSessionRoutes';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/reports', reportCardRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/id-cards', idCardRoutes);
app.use('/api/attendance/sessions', attendanceSessionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
