"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEnrollments = exports.enrollStudent = void 0;
const Enrollment_1 = __importDefault(require("../models/Enrollment")); // Import Enrollment model
const Student_1 = __importDefault(require("../models/Student")); // Import Student model for validation
const Classroom_1 = __importDefault(require("../models/Classroom")); // Import Classroom model for validation
const mongoose_1 = require("mongoose");
const enrollStudent = async (req, res) => {
    const { studentId, classroomId } = req.body;
    const institutionId = req.user?.institutionId; // Get institutionId from authenticated user
    if (!studentId || !classroomId || !institutionId) {
        return res.status(400).json({ message: 'Please provide studentId, classroomId, and ensure user is authenticated.' });
    }
    try {
        // Validate ObjectId formats
        if (!mongoose_1.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid student ID format' });
        }
        if (!mongoose_1.Types.ObjectId.isValid(classroomId)) {
            return res.status(400).json({ message: 'Invalid classroom ID format' });
        }
        if (!mongoose_1.Types.ObjectId.isValid(institutionId)) {
            return res.status(400).json({ message: 'Invalid institution ID format' });
        }
        // Check if student and classroom exist within the same institution
        const studentExists = await Student_1.default.findOne({ _id: studentId, institutionId: new mongoose_1.Types.ObjectId(institutionId) });
        if (!studentExists) {
            return res.status(404).json({ message: 'Student not found or not in this institution.' });
        }
        const classroomExists = await Classroom_1.default.findOne({ _id: classroomId, institutionId: new mongoose_1.Types.ObjectId(institutionId) });
        if (!classroomExists) {
            return res.status(404).json({ message: 'Classroom not found or not in this institution.' });
        }
        // Check if student is already enrolled in this classroom
        const existingEnrollment = await Enrollment_1.default.findOne({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            status: 'active', // Only check active enrollments
        });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'Student is already actively enrolled in this classroom.' });
        }
        const newEnrollment = new Enrollment_1.default({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            enrollmentDate: new Date(), // Set current date
            status: 'active', // Default status
        });
        const enrollment = await newEnrollment.save();
        res.status(201).json({
            message: 'Student enrolled successfully',
            enrollment: {
                id: enrollment._id,
                studentId: enrollment.studentId,
                classroomId: enrollment.classroomId,
                institutionId: enrollment.institutionId,
                enrollmentDate: enrollment.enrollmentDate,
            },
        });
    }
    catch (error) {
        console.error('Error enrolling student:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.enrollStudent = enrollStudent;
const listEnrollments = async (req, res) => {
    const institutionId = req.user?.institutionId; // Filter enrollments by authenticated user's institution
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        const enrollments = await Enrollment_1.default.find({ institutionId: new mongoose_1.Types.ObjectId(institutionId) })
            .populate('studentId', 'name generatedId') // Populate student name and ID
            .populate('classroomId', 'name'); // Populate classroom name
        res.status(200).json(enrollments);
    }
    catch (error) {
        console.error('Error listing enrollments:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.listEnrollments = listEnrollments;
