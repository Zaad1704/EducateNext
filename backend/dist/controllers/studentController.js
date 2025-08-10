"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudents = exports.addStudent = void 0;
const Student_1 = __importDefault(require("../models/Student")); // Import Student model
const idGeneratorService_1 = require("../services/idGeneratorService"); // Import ID generator service
const mongoose_1 = require("mongoose"); // For ObjectId validation
const addStudent = async (req, res) => {
    const { name, admissionYear, classroomId, contactEmail, contactPhone, dateOfBirth, guardianInfo, emergencyContacts, medicalNotes, photoUrl, govtIdNumber, govtIdImageUrlFront, govtIdImageUrlBack } = req.body;
    const institutionId = req.user?.institutionId; // Get institutionId from authenticated user
    // Basic validation (adjust as needed for required fields)
    if (!name || !admissionYear || !classroomId || !contactEmail || !dateOfBirth || !institutionId) {
        return res.status(400).json({ message: 'Please enter all required student fields: name, admissionYear, classroomId, contactEmail, dateOfBirth, and ensure user is authenticated.' });
    }
    try {
        // Validate ObjectId formats
        if (!mongoose_1.Types.ObjectId.isValid(classroomId)) {
            return res.status(400).json({ message: 'Invalid classroom ID format' });
        }
        if (!mongoose_1.Types.ObjectId.isValid(institutionId)) {
            return res.status(400).json({ message: 'Invalid institution ID format' });
        }
        // Generate unique student ID
        const generatedId = await (0, idGeneratorService_1.generateStudentId)(institutionId, admissionYear);
        const newStudent = new Student_1.default({
            name,
            generatedId,
            admissionYear,
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            contactEmail,
            contactPhone,
            dateOfBirth: new Date(dateOfBirth), // Convert to Date object
            guardianInfo: guardianInfo || [],
            emergencyContacts: emergencyContacts || [],
            medicalNotes,
            photoUrl,
            govtIdNumber,
            govtIdImageUrlFront,
            govtIdImageUrlBack,
        });
        const student = await newStudent.save();
        res.status(201).json({
            message: 'Student added successfully',
            student: {
                id: student._id,
                name: student.name,
                generatedId: student.generatedId,
                admissionYear: student.admissionYear,
                institutionId: student.institutionId,
                classroomId: student.classroomId,
            },
        });
    }
    catch (error) {
        console.error('Error adding student:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addStudent = addStudent;
const listStudents = async (req, res) => {
    const institutionId = req.user?.institutionId; // Filter students by authenticated user's institution
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        const students = await Student_1.default.find({ institutionId: new mongoose_1.Types.ObjectId(institutionId) })
            .populate('classroomId', 'name') // Populate classroom name
            .select('-guardianInfo -emergencyContacts -medicalNotes -govtIdNumber -govtIdImageUrlFront -govtIdImageUrlBack -__v'); // Exclude sensitive/large fields by default
        res.status(200).json(students);
    }
    catch (error) {
        console.error('Error listing students:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.listStudents = listStudents;
