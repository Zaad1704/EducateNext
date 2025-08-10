"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAssignment = exports.getAssignments = exports.createAssignment = void 0;
const Assignment_1 = __importDefault(require("../models/Assignment"));
const mongoose_1 = require("mongoose");
const createAssignment = async (req, res) => {
    const { subjectId, classroomId, title, description, type, maxMarks, dueDate, instructions, attachments } = req.body;
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    try {
        const assignment = new Assignment_1.default({
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            subjectId: new mongoose_1.Types.ObjectId(subjectId),
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            title,
            description,
            type,
            maxMarks,
            dueDate: new Date(dueDate),
            instructions,
            attachments: attachments || [],
            isPublished: false,
        });
        await assignment.save();
        res.status(201).json({
            message: 'Assignment created successfully',
            assignment,
        });
    }
    catch (error) {
        console.error('Error creating assignment:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createAssignment = createAssignment;
const getAssignments = async (req, res) => {
    const { classroomId, subjectId, type } = req.query;
    const institutionId = req.user?.institutionId;
    try {
        const query = { institutionId: new mongoose_1.Types.ObjectId(institutionId) };
        if (classroomId)
            query.classroomId = new mongoose_1.Types.ObjectId(classroomId);
        if (subjectId)
            query.subjectId = new mongoose_1.Types.ObjectId(subjectId);
        if (type)
            query.type = type;
        const assignments = await Assignment_1.default.find(query)
            .populate('teacherId', 'name')
            .populate('subjectId', 'name code')
            .populate('classroomId', 'name')
            .sort({ dueDate: -1 });
        res.status(200).json(assignments);
    }
    catch (error) {
        console.error('Error fetching assignments:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAssignments = getAssignments;
const submitAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const { attachments } = req.body;
    const studentId = req.user?.id;
    try {
        const assignment = await Assignment_1.default.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const now = new Date();
        const status = now > assignment.dueDate ? 'late' : 'submitted';
        const existingSubmission = assignment.submissions.find(sub => sub.studentId.toString() === studentId);
        if (existingSubmission) {
            existingSubmission.submittedAt = now;
            existingSubmission.attachments = attachments || [];
            existingSubmission.status = status;
        }
        else {
            assignment.submissions.push({
                studentId: new mongoose_1.Types.ObjectId(studentId),
                submittedAt: now,
                attachments: attachments || [],
                status,
            });
        }
        await assignment.save();
        res.status(200).json({
            message: 'Assignment submitted successfully',
            status,
        });
    }
    catch (error) {
        console.error('Error submitting assignment:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.submitAssignment = submitAssignment;
