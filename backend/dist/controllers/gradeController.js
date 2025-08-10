"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassGrades = exports.bulkCreateGrades = exports.calculateStudentGPA = exports.publishGrades = exports.getStudentGrades = exports.createGrade = void 0;
const Grade_1 = __importDefault(require("../models/Grade"));
const gradingService_1 = require("../services/gradingService");
const mongoose_1 = require("mongoose");
const createGrade = async (req, res) => {
    const { studentId, subjectId, classroomId, academicYear, semester, gradeType, title, maxMarks, obtainedMarks, date, remarks, weightage } = req.body;
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    if (!studentId || !subjectId || !classroomId || !academicYear || !semester ||
        !gradeType || !title || !maxMarks || obtainedMarks === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const percentage = (obtainedMarks / maxMarks) * 100;
        const grade = (0, gradingService_1.calculateGrade)(percentage);
        const gpa = (0, gradingService_1.calculateGPA)(percentage);
        const newGrade = new Grade_1.default({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            subjectId: new mongoose_1.Types.ObjectId(subjectId),
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            academicYear,
            semester,
            gradeType,
            title,
            maxMarks,
            obtainedMarks,
            percentage,
            grade,
            gpa,
            date: new Date(date),
            remarks,
            weightage: weightage || 1,
            isPublished: false,
        });
        await newGrade.save();
        res.status(201).json({
            message: 'Grade created successfully',
            grade: newGrade,
        });
    }
    catch (error) {
        console.error('Error creating grade:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createGrade = createGrade;
const getStudentGrades = async (req, res) => {
    const { studentId } = req.params;
    const { academicYear, semester, subjectId } = req.query;
    const institutionId = req.user?.institutionId;
    try {
        const query = {
            studentId: new mongoose_1.Types.ObjectId(studentId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            isPublished: true
        };
        if (academicYear)
            query.academicYear = academicYear;
        if (semester)
            query.semester = semester;
        if (subjectId)
            query.subjectId = new mongoose_1.Types.ObjectId(subjectId);
        const grades = await Grade_1.default.find(query)
            .populate('subjectId', 'name code')
            .populate('teacherId', 'name')
            .sort({ date: -1 });
        res.status(200).json(grades);
    }
    catch (error) {
        console.error('Error fetching student grades:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getStudentGrades = getStudentGrades;
const publishGrades = async (req, res) => {
    const { gradeIds } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        await Grade_1.default.updateMany({
            _id: { $in: gradeIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        }, { isPublished: true });
        res.status(200).json({ message: 'Grades published successfully' });
    }
    catch (error) {
        console.error('Error publishing grades:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.publishGrades = publishGrades;
const calculateStudentGPA = async (req, res) => {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;
    const institutionId = req.user?.institutionId;
    try {
        const grades = await Grade_1.default.find({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
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
    }
    catch (error) {
        console.error('Error calculating GPA:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.calculateStudentGPA = calculateStudentGPA;
const bulkCreateGrades = async (req, res) => {
    const { grades } = req.body;
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    try {
        const gradePromises = grades.map(async (gradeData) => {
            const percentage = (gradeData.obtainedMarks / gradeData.maxMarks) * 100;
            const grade = (0, gradingService_1.calculateGrade)(percentage);
            const gpa = (0, gradingService_1.calculateGPA)(percentage);
            return new Grade_1.default({
                ...gradeData,
                teacherId: new mongoose_1.Types.ObjectId(teacherId),
                institutionId: new mongoose_1.Types.ObjectId(institutionId),
                percentage,
                grade,
                gpa,
                date: new Date(gradeData.date),
            });
        });
        const createdGrades = await Promise.all(gradePromises);
        await Grade_1.default.insertMany(createdGrades);
        res.status(201).json({
            message: 'Bulk grades created successfully',
            count: createdGrades.length,
        });
    }
    catch (error) {
        console.error('Error creating bulk grades:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.bulkCreateGrades = bulkCreateGrades;
const getClassGrades = async (req, res) => {
    const { classroomId } = req.params;
    const { academicYear, semester, subjectId } = req.query;
    const institutionId = req.user?.institutionId;
    try {
        const query = {
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
        };
        if (academicYear)
            query.academicYear = academicYear;
        if (semester)
            query.semester = semester;
        if (subjectId)
            query.subjectId = new mongoose_1.Types.ObjectId(subjectId);
        const grades = await Grade_1.default.find(query)
            .populate('studentId', 'name generatedId')
            .populate('subjectId', 'name code')
            .sort({ date: -1 });
        res.status(200).json(grades);
    }
    catch (error) {
        console.error('Error fetching class grades:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getClassGrades = getClassGrades;
