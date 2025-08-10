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

// Grade validation
export const validateGrade = [
  body('studentId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid student ID format');
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
  body('grade')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Grade must be a number between 0 and 100'),
  body('gradingPeriod')
    .isIn(['midterm', 'final', 'quiz', 'assignment', 'project'])
    .withMessage('Invalid grading period'),
  handleValidationErrors
];

// Payment validation
export const validatePayment = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .isIn(['USD', 'EUR', 'GBP', 'CAD'])
    .withMessage('Invalid currency'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'cash'])
    .withMessage('Invalid payment method'),
  body('studentId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid student ID format');
      }
      return true;
    }),
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

// File upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.' });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
  }

  next();
};