// backend/middleware/validation.ts
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }))
    });
  }
  next();
};

// Common validators
export const validateObjectId = (field: string) => {
  return param(field).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${field} format`);
    }
    return true;
  });
};

export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const validatePassword = body('password')
  .isLength({ min: 8, max: 128 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must be 8-128 characters with uppercase, lowercase, number, and special character');

export const validateName = body('name')
  .isLength({ min: 2, max: 50 })
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes');

// User registration validation
export const validateUserRegistration = [
  validateName,
  validateEmail,
  validatePassword,
  body('role')
    .isIn(['admin', 'teacher', 'student', 'parent'])
    .withMessage('Role must be admin, teacher, student, or parent'),
  body('institutionId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid institution ID format');
      }
      return true;
    }),
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  validateEmail,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Student enrollment validation
export const validateStudentEnrollment = [
  body('studentId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid student ID format');
      }
      return true;
    }),
  body('classroomId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid classroom ID format');
      }
      return true;
    }),
  handleValidationErrors
];

// Enhanced grade validation
export const validateGrade = [
  body('studentId')
    .custom((value) => {
      if (!value || typeof value !== 'string') {
        throw new Error('Student ID is required');
      }
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid student ID format');
      }
      return true;
    }),
  body('subjectId')
    .custom((value) => {
      if (!value || typeof value !== 'string') {
        throw new Error('Subject ID is required');
      }
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid subject ID format');
      }
      return true;
    }),
  body('classroomId')
    .custom((value) => {
      if (!value || typeof value !== 'string') {
        throw new Error('Classroom ID is required');
      }
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid classroom ID format');
      }
      return true;
    }),
  body('academicYear')
    .isLength({ min: 4, max: 9 })
    .matches(/^\d{4}(-\d{4})?$/)
    .withMessage('Academic year must be in format YYYY or YYYY-YYYY'),
  body('semester')
    .isIn(['fall', 'spring', 'summer', '1', '2', '3'])
    .withMessage('Invalid semester'),
  body('gradeType')
    .isIn(['midterm', 'final', 'quiz', 'assignment', 'project', 'participation', 'homework'])
    .withMessage('Invalid grade type'),
  body('title')
    .isLength({ min: 3, max: 100 })
    .matches(/^[a-zA-Z0-9\s\-_.,()]+$/)
    .withMessage('Title must be 3-100 characters with valid characters only'),
  body('maxMarks')
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Max marks must be between 1 and 1000'),
  body('obtainedMarks')
    .isFloat({ min: 0 })
    .custom((value, { req }) => {
      if (value > req.body.maxMarks) {
        throw new Error('Obtained marks cannot exceed max marks');
      }
      return true;
    })
    .withMessage('Obtained marks must be valid'),
  body('date')
    .isISO8601()
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneMonthFuture = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      if (date < oneYearAgo || date > oneMonthFuture) {
        throw new Error('Date must be within the last year and not more than one month in the future');
      }
      return true;
    })
    .withMessage('Invalid date'),
  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .matches(/^[a-zA-Z0-9\s\-_.,()!?]+$/)
    .withMessage('Remarks must be under 500 characters with valid characters only'),
  body('weightage')
    .optional()
    .isFloat({ min: 0.1, max: 10 })
    .withMessage('Weightage must be between 0.1 and 10'),
  handleValidationErrors
];

// Enhanced payment validation
export const validatePayment = [
  body('feeBillId')
    .custom((value) => {
      if (!value || typeof value !== 'string') {
        throw new Error('Fee bill ID is required');
      }
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid fee bill ID format');
      }
      return true;
    }),
  body('amountPaid')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'])
    .withMessage('Invalid currency code'),
  body('paymentMethod')
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'online'])
    .withMessage('Invalid payment method'),
  body('transactionId')
    .optional()
    .isLength({ min: 3, max: 100 })
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('Transaction ID must be 3-100 alphanumeric characters'),
  body('receiptUrl')
    .optional()
    .isURL({ protocols: ['https'] })
    .withMessage('Receipt URL must be a valid HTTPS URL'),
  handleValidationErrors
];

// Assignment validation
export const validateAssignment = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10-1000 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('subjectId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid subject ID format');
      }
      return true;
    }),
  body('classroomId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid classroom ID format');
      }
      return true;
    }),
  handleValidationErrors
];

// Attendance session validation
export const validateAttendanceSession = [
  body('classroomId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid classroom ID format');
      }
      return true;
    }),
  body('subjectId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid subject ID format');
      }
      return true;
    }),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  handleValidationErrors
];

// CMS content validation
export const validateCMSContent = [
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be 3-200 characters'),
  body('content')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be 10-10000 characters'),
  body('type')
    .isIn(['page', 'post', 'announcement', 'event'])
    .withMessage('Invalid content type'),
  body('status')
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

// Enhanced file upload validation
export const validateFileUpload = async (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');
  const userId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    if (!req.file) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'FILE_UPLOAD_NO_FILE',
        resource: 'file_upload',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'No file provided in upload request',
        sensitiveData: false
      }).save().catch(err => console.error('Failed to log file upload error:', err));
      
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Enhanced file type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'FILE_UPLOAD_INVALID_TYPE',
        resource: 'file_upload',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: `Invalid file type: ${req.file.mimetype}`,
        sensitiveData: false,
        metadata: {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      }).save().catch(err => console.error('Failed to log file type error:', err));
      
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.',
        allowedTypes
      });
    }

    // Enhanced size validation
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (req.file.size > maxSize) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'FILE_UPLOAD_SIZE_EXCEEDED',
        resource: 'file_upload',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: `File size exceeded: ${req.file.size} bytes`,
        sensitiveData: false,
        metadata: {
          filename: req.file.originalname,
          size: req.file.size,
          maxSize
        }
      }).save().catch(err => console.error('Failed to log file size error:', err));
      
      return res.status(400).json({ 
        error: 'File size too large. Maximum size is 2MB.',
        maxSize: '2MB',
        receivedSize: `${Math.round(req.file.size / 1024)}KB`
      });
    }

    // Filename validation
    const filename = req.file.originalname;
    if (!/^[a-zA-Z0-9\s\-_\.()]+$/.test(filename)) {
      return res.status(400).json({ 
        error: 'Invalid filename. Only alphanumeric characters, spaces, hyphens, underscores, dots, and parentheses are allowed.' 
      });
    }

    // File extension validation
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ 
        error: 'Invalid file extension.',
        allowedExtensions
      });
    }

    // Log successful file validation
    await new AuditLog({
      userId,
      institutionId,
      action: 'FILE_UPLOAD_VALIDATED',
      resource: 'file_upload',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: true,
      errorMessage: null,
      sensitiveData: false,
      metadata: {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    }).save().catch(err => console.error('Failed to log file validation:', err));

    next();
  } catch (error: any) {
    console.error('File validation error:', error);
    res.status(500).json({ error: 'File validation failed' });
  }
};

// QR code validation
export const validateQRCode = [
  body('data')
    .isLength({ min: 10, max: 500 })
    .matches(/^[a-zA-Z0-9\-_:.,/]+$/)
    .withMessage('QR code data must be 10-500 characters with valid characters only'),
  body('type')
    .isIn(['student', 'teacher', 'classroom', 'attendance'])
    .withMessage('Invalid QR code type'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    })
    .withMessage('Invalid expiration date'),
  handleValidationErrors
];

// Attendance validation
export const validateAttendance = [
  body('qrCode')
    .isLength({ min: 10, max: 500 })
    .matches(/^[a-zA-Z0-9\-_:.,/]+$/)
    .withMessage('Invalid QR code format'),
  body('location')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        const { latitude, longitude } = value;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          throw new Error('Location must have valid latitude and longitude');
        }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          throw new Error('Invalid GPS coordinates');
        }
      }
      return true;
    })
    .withMessage('Invalid location data'),
  handleValidationErrors
];