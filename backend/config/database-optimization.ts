import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Database optimization configuration
export const dbOptimizationConfig = {
  // Connection pooling settings
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
  
  // Performance settings
  readPreference: 'secondaryPreferred',
  writeConcern: { w: 'majority', j: true },
  readConcern: { level: 'majority' }
};

// Critical indexes for performance
export const performanceIndexes = [
  // User indexes
  { collection: 'users', index: { institutionId: 1, role: 1, status: 1 } },
  { collection: 'users', index: { email: 1 }, options: { unique: true } },
  
  // Student indexes
  { collection: 'students', index: { institutionId: 1, classroomId: 1 } },
  { collection: 'students', index: { studentId: 1 }, options: { unique: true } },
  { collection: 'students', index: { institutionId: 1, status: 1 } },
  
  // Attendance indexes
  { collection: 'attendancerecords', index: { studentId: 1, date: -1, status: 1 } },
  { collection: 'attendancerecords', index: { classroomId: 1, date: -1 } },
  { collection: 'attendancerecords', index: { institutionId: 1, date: -1 } },
  
  // Grade indexes
  { collection: 'grades', index: { studentId: 1, subjectId: 1, gradingPeriod: 1 } },
  { collection: 'grades', index: { classroomId: 1, gradingPeriod: 1 } },
  
  // Assignment indexes
  { collection: 'assignments', index: { classroomId: 1, dueDate: -1 } },
  { collection: 'assignments', index: { subjectId: 1, status: 1 } },
  
  // Enrollment indexes
  { collection: 'enrollments', index: { classroomId: 1, status: 1 } },
  { collection: 'enrollments', index: { studentId: 1, academicYear: 1 } },
  
  // QR Code indexes
  { collection: 'qrcodes', index: { code: 1 }, options: { unique: true } },
  { collection: 'qrcodes', index: { entityId: 1, entityType: 1 } },
  
  // Teacher monitoring indexes
  { collection: 'teachermonitorings', index: { teacherId: 1, timestamp: -1 } },
  { collection: 'teachermonitorings', index: { institutionId: 1, timestamp: -1 } }
];

// Initialize database indexes
export const initializeIndexes = async (): Promise<void> => {
  try {
    logger.info('Initializing database indexes...');
    
    for (const indexConfig of performanceIndexes) {
      const collection = mongoose.connection.db.collection(indexConfig.collection);
      await collection.createIndex(indexConfig.index, indexConfig.options || {});
      logger.info(`Index created for ${indexConfig.collection}:`, indexConfig.index);
    }
    
    logger.info('All database indexes initialized successfully');
  } catch (error) {
    logger.error('Error initializing database indexes:', error);
    throw error;
  }
};

// Database performance monitoring
export const enablePerformanceMonitoring = (): void => {
  // Enable MongoDB profiler for slow queries
  mongoose.connection.db.admin().command({
    profile: 2,
    slowms: 200,
    sampleRate: 1.0
  });
  
  // Monitor connection events
  mongoose.connection.on('connected', () => {
    logger.info('Database connected with optimization settings');
  });
  
  mongoose.connection.on('error', (error) => {
    logger.error('Database connection error:', error);
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.warn('Database disconnected');
  });
};

// Query optimization utilities
export const optimizedQuery = {
  // Paginated query with performance optimization
  paginate: (query: any, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit).lean();
  },
  
  // Aggregation pipeline optimization
  optimizeAggregation: (pipeline: any[]) => {
    // Add $limit early in pipeline when possible
    // Use $project to reduce document size
    // Ensure indexes are used with $match at beginning
    return pipeline;
  }
};