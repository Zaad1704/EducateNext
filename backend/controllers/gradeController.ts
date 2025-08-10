import { Request, Response } from 'express';
import Grade from '../models/Grade';
import ReportCard from '../models/ReportCard';
import Student from '../models/Student';
import { calculateGPA, calculateGrade } from '../services/gradingService';
import { Types } from 'mongoose';
import { securityUtils } from '../config/security';
import { AuditLog } from '../middleware/auditLogger';
import { validationResult } from 'express-validator';

export const createGrade = async (req: Request, res: Response) => {
  const { 
    studentId, subjectId, classroomId, academicYear, semester, 
    gradeType, title, maxMarks, obtainedMarks, date, remarks, weightage 
  } = req.body;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Enhanced validation
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      await new AuditLog({
        userId: teacherId,
        institutionId,
        action: 'GRADE_CREATE_VALIDATION_FAILED',
        resource: 'grade_management',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Grade creation validation failed',
        sensitiveData: false,
        metadata: { errors: validationErrors.array() }
      }).save().catch(err => console.error('Failed to log validation error:', err));
      
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors.array()
      });
    }

    // Verify teacher has permission to grade this student
    const student = await Student.findOne({
      _id: new Types.ObjectId(studentId),
      institutionId: new Types.ObjectId(institutionId)
    });
    
    if (!student) {
      await new AuditLog({
        userId: teacherId,
        institutionId,
        action: 'GRADE_CREATE_UNAUTHORIZED_STUDENT',
        resource: 'grade_management',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Attempted to grade unauthorized student',
        sensitiveData: true,
        metadata: { attemptedStudentId: studentId }
      }).save().catch(err => console.error('Failed to log unauthorized access:', err));
      
      return res.status(403).json({ message: 'Unauthorized to grade this student' });
    }

    // Validate grade data
    if (obtainedMarks < 0 || obtainedMarks > maxMarks) {
      return res.status(400).json({ message: 'Invalid marks: obtained marks must be between 0 and max marks' });
    }

    if (maxMarks <= 0) {
      return res.status(400).json({ message: 'Invalid marks: max marks must be greater than 0' });
    }

    // Calculate grade metrics
    const percentage = Math.round((obtainedMarks / maxMarks) * 100 * 100) / 100; // Round to 2 decimal places
    const grade = calculateGrade(percentage);
    const gpa = calculateGPA(percentage);

    // Create grade with enhanced security
    const newGrade = new Grade({
      studentId: new Types.ObjectId(studentId),
      teacherId: new Types.ObjectId(teacherId),
      subjectId: new Types.ObjectId(subjectId),
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId),
      academicYear: securityUtils.sanitizeInput(academicYear),
      semester: securityUtils.sanitizeInput(semester),
      gradeType: securityUtils.sanitizeInput(gradeType),
      title: securityUtils.sanitizeInput(title),
      maxMarks: Math.max(0, Number(maxMarks)),
      obtainedMarks: Math.max(0, Number(obtainedMarks)),
      percentage,
      grade,
      gpa,
      date: new Date(date),
      remarks: remarks ? securityUtils.sanitizeInput(remarks) : '',
      weightage: Math.max(0.1, Number(weightage) || 1),
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newGrade.save();

    // Log successful grade creation
    await new AuditLog({
      userId: teacherId,
      institutionId,
      action: 'GRADE_CREATED',
      resource: 'grade_management',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: true,
      errorMessage: null,
      sensitiveData: true,
      metadata: {
        gradeId: newGrade._id.toString(),
        studentId,
        subjectId,
        percentage,
        grade,
        gpa
      }
    }).save().catch(err => console.error('Failed to log grade creation:', err));

    res.status(201).json({
      message: 'Grade created successfully',
      grade: {
        id: newGrade._id,
        studentId: newGrade.studentId,
        subjectId: newGrade.subjectId,
        percentage: newGrade.percentage,
        grade: newGrade.grade,
        gpa: newGrade.gpa,
        isPublished: newGrade.isPublished,
        createdAt: newGrade.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error creating grade:', error);
    
    await new AuditLog({
      userId: teacherId,
      institutionId,
      action: 'GRADE_CREATE_ERROR',
      resource: 'grade_management',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: error.message,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log grade creation error:', err));
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentGrades = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { academicYear, semester, subjectId } = req.query;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const institutionId = req.user?.institutionId;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    // Authorization check - only allow access to own grades or authorized personnel
    if (userRole === 'student' && userId !== studentId) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'GRADE_ACCESS_UNAUTHORIZED',
        resource: 'grade_access',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Student attempted to access another student\'s grades',
        sensitiveData: true,
        metadata: { attemptedStudentId: studentId }
      }).save().catch(err => console.error('Failed to log unauthorized access:', err));
      
      return res.status(403).json({ message: 'Unauthorized to access these grades' });
    }

    // Verify student exists and belongs to institution
    const student = await Student.findOne({
      _id: new Types.ObjectId(studentId),
      institutionId: new Types.ObjectId(institutionId)
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Build secure query
    const query: any = { 
      studentId: new Types.ObjectId(studentId),
      institutionId: new Types.ObjectId(institutionId),
      isPublished: true 
    };

    // Sanitize and validate query parameters
    if (academicYear) {
      query.academicYear = securityUtils.sanitizeInput(academicYear as string);
    }
    if (semester) {
      query.semester = securityUtils.sanitizeInput(semester as string);
    }
    if (subjectId) {
      if (!Types.ObjectId.isValid(subjectId as string)) {
        return res.status(400).json({ message: 'Invalid subject ID format' });
      }
      query.subjectId = new Types.ObjectId(subjectId as string);
    }

    const grades = await Grade.find(query)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name')
      .select('-__v')
      .sort({ date: -1 })
      .limit(100); // Limit results for performance

    // Log grade access
    await new AuditLog({
      userId,
      institutionId,
      action: 'GRADES_ACCESSED',
      resource: 'grade_access',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: true,
      errorMessage: null,
      sensitiveData: true,
      metadata: {
        studentId,
        gradesCount: grades.length,
        filters: { academicYear, semester, subjectId }
      }
    }).save().catch(err => console.error('Failed to log grade access:', err));

    res.status(200).json({
      grades,
      total: grades.length,
      student: {
        id: student._id,
        name: student.name,
        generatedId: student.generatedId
      }
    });

  } catch (error: any) {
    console.error('Error fetching student grades:', error);
    
    await new AuditLog({
      userId,
      institutionId,
      action: 'GRADE_ACCESS_ERROR',
      resource: 'grade_access',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: error.message,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log grade access error:', err));
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const publishGrades = async (req: Request, res: Response) => {
  const { gradeIds } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const institutionId = req.user?.institutionId;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Authorization check - only teachers and admins can publish grades
    if (!['teacher', 'admin'].includes(userRole)) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'GRADE_PUBLISH_UNAUTHORIZED',
        resource: 'grade_management',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Unauthorized attempt to publish grades',
        sensitiveData: true,
        metadata: { userRole, attemptedGradeIds: gradeIds }
      }).save().catch(err => console.error('Failed to log unauthorized publish:', err));
      
      return res.status(403).json({ message: 'Unauthorized to publish grades' });
    }

    // Validate input
    if (!Array.isArray(gradeIds) || gradeIds.length === 0) {
      return res.status(400).json({ message: 'Grade IDs must be a non-empty array' });
    }

    if (gradeIds.length > 100) {
      return res.status(400).json({ message: 'Cannot publish more than 100 grades at once' });
    }

    // Validate all grade IDs
    const validGradeIds = gradeIds.filter(id => Types.ObjectId.isValid(id));
    if (validGradeIds.length !== gradeIds.length) {
      return res.status(400).json({ message: 'Invalid grade ID format detected' });
    }

    // Verify grades belong to the teacher (if teacher role) and institution
    const query: any = {
      _id: { $in: validGradeIds.map((id: string) => new Types.ObjectId(id)) },
      institutionId: new Types.ObjectId(institutionId)
    };

    // Teachers can only publish their own grades
    if (userRole === 'teacher') {
      query.teacherId = new Types.ObjectId(userId);
    }

    const gradesToPublish = await Grade.find(query);
    
    if (gradesToPublish.length === 0) {
      return res.status(404).json({ message: 'No grades found to publish' });
    }

    if (gradesToPublish.length !== validGradeIds.length) {
      await new AuditLog({
        userId,
        institutionId,
        action: 'GRADE_PUBLISH_PARTIAL_UNAUTHORIZED',
        resource: 'grade_management',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Attempted to publish grades not owned by user',
        sensitiveData: true,
        metadata: {
          requestedCount: validGradeIds.length,
          authorizedCount: gradesToPublish.length
        }
      }).save().catch(err => console.error('Failed to log partial unauthorized publish:', err));
      
      return res.status(403).json({ 
        message: 'Some grades are not authorized for publishing',
        authorizedCount: gradesToPublish.length,
        requestedCount: validGradeIds.length
      });
    }

    // Update grades to published
    const updateResult = await Grade.updateMany(
      { _id: { $in: gradesToPublish.map(g => g._id) } },
      { 
        isPublished: true,
        publishedAt: new Date(),
        publishedBy: new Types.ObjectId(userId),
        updatedAt: new Date()
      }
    );

    // Log successful grade publishing
    await new AuditLog({
      userId,
      institutionId,
      action: 'GRADES_PUBLISHED',
      resource: 'grade_management',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: true,
      errorMessage: null,
      sensitiveData: true,
      metadata: {
        publishedCount: updateResult.modifiedCount,
        gradeIds: gradesToPublish.map(g => g._id.toString())
      }
    }).save().catch(err => console.error('Failed to log grade publishing:', err));

    res.status(200).json({ 
      message: 'Grades published successfully',
      publishedCount: updateResult.modifiedCount
    });

  } catch (error: any) {
    console.error('Error publishing grades:', error);
    
    await new AuditLog({
      userId,
      institutionId,
      action: 'GRADE_PUBLISH_ERROR',
      resource: 'grade_management',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: error.message,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log grade publish error:', err));
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const calculateStudentGPA = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { academicYear, semester } = req.query;
  const institutionId = req.user?.institutionId;

  try {
    const grades = await Grade.find({
      studentId: new Types.ObjectId(studentId),
      institutionId: new Types.ObjectId(institutionId),
      academicYear,
      semester,
      isPublished: true,
    });

    if (grades.length === 0) {
      return res.status(404).json({ message: 'No published grades found' });
    }

    // Calculate weighted GPA
    let totalWeightedGPA = 0;
    let totalWeightage = 0;

    grades.forEach(grade => {
      totalWeightedGPA += grade.gpa * grade.weightage;
      totalWeightage += grade.weightage;
    });

    const overallGPA = totalWeightage > 0 ? totalWeightedGPA / totalWeightage : 0;
    const overallPercentage = grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length;

    res.status(200).json({
      studentId,
      academicYear,
      semester,
      overallGPA: Math.round(overallGPA * 100) / 100,
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      totalGrades: grades.length,
      gradeBreakdown: grades.map(grade => ({
        subject: grade.subjectId,
        gpa: grade.gpa,
        percentage: grade.percentage,
        weightage: grade.weightage,
      })),
    });

  } catch (error: any) {
    console.error('Error calculating GPA:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const bulkCreateGrades = async (req: Request, res: Response) => {
  const { grades } = req.body;
  const teacherId = req.user?.id;
  const institutionId = req.user?.institutionId;

  try {
    const gradePromises = grades.map(async (gradeData: any) => {
      const percentage = (gradeData.obtainedMarks / gradeData.maxMarks) * 100;
      const grade = calculateGrade(percentage);
      const gpa = calculateGPA(percentage);

      return new Grade({
        ...gradeData,
        teacherId: new Types.ObjectId(teacherId),
        institutionId: new Types.ObjectId(institutionId),
        percentage,
        grade,
        gpa,
        date: new Date(gradeData.date),
      });
    });

    const createdGrades = await Promise.all(gradePromises);
    await Grade.insertMany(createdGrades);

    res.status(201).json({
      message: 'Bulk grades created successfully',
      count: createdGrades.length,
    });

  } catch (error: any) {
    console.error('Error creating bulk grades:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getClassGrades = async (req: Request, res: Response) => {
  const { classroomId } = req.params;
  const { academicYear, semester, subjectId } = req.query;
  const institutionId = req.user?.institutionId;

  try {
    const query: any = {
      classroomId: new Types.ObjectId(classroomId),
      institutionId: new Types.ObjectId(institutionId),
    };

    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    if (subjectId) query.subjectId = new Types.ObjectId(subjectId as string);

    const grades = await Grade.find(query)
      .populate('studentId', 'name generatedId')
      .populate('subjectId', 'name code')
      .sort({ date: -1 });

    res.status(200).json(grades);

  } catch (error: any) {
    console.error('Error fetching class grades:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};