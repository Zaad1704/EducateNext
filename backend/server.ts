// backend/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connectDB } from './config/database';
import { initializeIndexes, enablePerformanceMonitoring } from './config/database-optimization';
import { redis } from './config/redis';
import { 
  securityHeaders, 
  generalRateLimit, 
  authRateLimit, 
  sanitizeInput, 
  preventInjection 
} from './middleware/security';
import { rateLimiters, preventSQLInjection, preventXSS, auditLogger } from './middleware/apiSecurity';
import { performanceMiddleware, getHealthCheck } from './services/performanceService';
import { errorHandler, notFoundHandler, handleUnhandledRejection, handleUncaughtException } from './middleware/errorHandler';
import { cacheStrategies } from './middleware/cache';
import { auditLogger as originalAuditLogger } from './middleware/auditLogger';
import { csrfProtection, setCSRFToken, getCSRFToken } from './middleware/csrf';
import { logger } from './utils/logger';

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
import cmsRoutes from './routes/cmsRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import teacherMonitoringRoutes from './routes/teacherMonitoringRoutes';
import mfaRoutes from './routes/mfaRoutes';
import complianceRoutes from './routes/complianceRoutes';

dotenv.config();

// Initialize error handlers
handleUnhandledRejection();
handleUncaughtException();

// Connect to database and initialize optimizations
connectDB().then(async () => {
  await initializeIndexes();
  enablePerformanceMonitoring();
  logger.info('Database optimization initialized');
}).catch(error => {
  logger.error('Database initialization failed:', error);
  process.exit(1);
});

// Initialize Redis connection
redis.connect().catch(error => {
  logger.error('Redis connection failed:', error);
});

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-csrf-token'],
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/educatenext'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '3600000')
  }
}));

// Performance monitoring
if (process.env.ENABLE_PERFORMANCE_MONITORING === 'true') {
  app.use(performanceMiddleware);
}

// Rate limiting with enhanced security
app.use('/api/', rateLimiters.api);
app.use('/api/auth', rateLimiters.auth);
app.use('/api/payments', rateLimiters.sensitive);
app.use('/api/admin', rateLimiters.sensitive);

// Enhanced input sanitization and security
app.use(sanitizeInput);
app.use(preventSQLInjection);
app.use(preventXSS);
app.use(preventInjection);

// CSRF protection
app.use(setCSRFToken);
app.use(csrfProtection);

// CSRF token endpoint
app.get('/api/csrf-token', getCSRFToken);

// Compression middleware
app.use(compression());

// Body parsing middleware with size limits
const maxFileSize = process.env.MAX_FILE_SIZE || '5242880'; // 5MB default
app.use(express.json({ limit: maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: maxFileSize }));

// Audit logging middleware
if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
  app.use(originalAuditLogger);
  app.use(auditLogger);
}

// Enhanced health check endpoint (no CSRF required)
app.get('/health', async (req, res) => {
  try {
    const healthData = await getHealthCheck();
    res.status(200).json(healthData);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// Security info endpoint
app.get('/api/security-info', (req, res) => {
  res.json({
    csrfProtection: true,
    httpsOnly: process.env.NODE_ENV === 'production',
    rateLimit: true
  });
});

// API Routes with caching strategies
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
app.use('/api/cms', cmsRoutes);
app.use('/api/analytics', cacheStrategies.analytics, analyticsRoutes);
app.use('/api/teacher-monitoring', teacherMonitoringRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/compliance', complianceRoutes);

// 404 handler
app.use('*', notFoundHandler);

// Enhanced global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
  logger.info(`⚡ Performance monitoring: ${process.env.ENABLE_PERFORMANCE_MONITORING === 'true' ? 'Enabled' : 'Disabled'}`);
  logger.info(`🔄 Redis caching: ${redis.status === 'ready' ? 'Connected' : 'Disconnected'}`);
});
