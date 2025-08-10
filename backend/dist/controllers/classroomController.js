"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClassrooms = exports.createClassroom = void 0;
const Classroom_1 = __importDefault(require("../models/Classroom")); // Import Classroom model
const Teacher_1 = __importDefault(require("../models/Teacher")); // Import Teacher model for validation
const mongoose_1 = require("mongoose");
const createClassroom = async (req, res) => {
    const { name, primaryTeacherId, capacity } = req.body;
    const institutionId = req.user?.institutionId; // Get institutionId from authenticated user
    if (!name || !primaryTeacherId || !capacity || !institutionId) {
        return res.status(400).json({ message: 'Please enter all required fields: name, primaryTeacherId, capacity, and ensure user is authenticated.' });
    }
    try {
        // Validate ObjectId formats
        if (!mongoose_1.Types.ObjectId.isValid(primaryTeacherId)) {
            return res.status(400).json({ message: 'Invalid primary teacher ID format' });
        }
        if (!mongoose_1.Types.ObjectId.isValid(institutionId)) {
            return res.status(400).json({ message: 'Invalid institution ID format' });
        }
        // Optional: Check if primaryTeacherId actually refers to an existing teacher
        const teacherExists = await Teacher_1.default.findById(primaryTeacherId);
        if (!teacherExists) {
            return res.status(404).json({ message: 'Primary teacher not found.' });
        }
        const newClassroom = new Classroom_1.default({
            name,
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            primaryTeacherId: new mongoose_1.Types.ObjectId(primaryTeacherId),
            capacity,
        });
        const classroom = await newClassroom.save();
        res.status(201).json({
            message: 'Classroom created successfully',
            classroom: {
                id: classroom._id,
                name: classroom.name,
                institutionId: classroom.institutionId,
                primaryTeacherId: classroom.primaryTeacherId,
                capacity: classroom.capacity,
            },
        });
    }
    catch (error) {
        console.error('Error creating classroom:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createClassroom = createClassroom;
const listClassrooms = async (req, res) => {
    const institutionId = req.user?.institutionId; // Filter classrooms by authenticated user's institution
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        const classrooms = await Classroom_1.default.find({ institutionId: new mongoose_1.Types.ObjectId(institutionId) })
            .populate('primaryTeacherId', 'employeeId'); // Populate teacher employeeId
        res.status(200).json(classrooms);
    }
    catch (error) {
        console.error('Error listing classrooms:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.listClassrooms = listClassrooms;
