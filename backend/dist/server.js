"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const institutionRoutes_1 = __importDefault(require("./routes/institutionRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes"));
const classroomRoutes_1 = __importDefault(require("./routes/classroomRoutes"));
const subjectRoutes_1 = __importDefault(require("./routes/subjectRoutes"));
const enrollmentRoutes_1 = __importDefault(require("./routes/enrollmentRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const feeRoutes_1 = __importDefault(require("./routes/feeRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const qrRoutes_1 = __importDefault(require("./routes/qrRoutes"));
const gradeRoutes_1 = __importDefault(require("./routes/gradeRoutes"));
const assignmentRoutes_1 = __importDefault(require("./routes/assignmentRoutes"));
const reportCardRoutes_1 = __importDefault(require("./routes/reportCardRoutes"));
const evaluationRoutes_1 = __importDefault(require("./routes/evaluationRoutes"));
const idCardRoutes_1 = __importDefault(require("./routes/idCardRoutes"));
const attendanceSessionRoutes_1 = __importDefault(require("./routes/attendanceSessionRoutes"));
const cmsRoutes_1 = __importDefault(require("./routes/cmsRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const teacherMonitoringRoutes_1 = __importDefault(require("./routes/teacherMonitoringRoutes"));
dotenv_1.default.config();
(0, database_1.connectDB)();
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Compression middleware
app.use((0, compression_1.default)());
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/institutions', institutionRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/students', studentRoutes_1.default);
app.use('/api/teachers', teacherRoutes_1.default);
app.use('/api/classrooms', classroomRoutes_1.default);
app.use('/api/subjects', subjectRoutes_1.default);
app.use('/api/enrollments', enrollmentRoutes_1.default);
app.use('/api/attendance', attendanceRoutes_1.default);
app.use('/api/fees', feeRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/expenses', expenseRoutes_1.default);
app.use('/api/qr', qrRoutes_1.default);
app.use('/api/grades', gradeRoutes_1.default);
app.use('/api/assignments', assignmentRoutes_1.default);
app.use('/api/reports', reportCardRoutes_1.default);
app.use('/api/evaluations', evaluationRoutes_1.default);
app.use('/api/id-cards', idCardRoutes_1.default);
app.use('/api/attendance/sessions', attendanceSessionRoutes_1.default);
app.use('/api/cms', cmsRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/teacher-monitoring', teacherMonitoringRoutes_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
