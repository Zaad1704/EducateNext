"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeeBills = exports.createFeeBill = void 0;
const FeeBill_1 = __importDefault(require("../models/FeeBill"));
const Student_1 = __importDefault(require("../models/Student"));
const mongoose_1 = require("mongoose");
const createFeeBill = async (req, res) => {
    const { studentId, academicYear, amount, dueDate, items } = req.body;
    const institutionId = req.user?.institutionId;
    if (!studentId || !academicYear || !amount || !dueDate || !items || !institutionId) {
        return res.status(400).json({ message: 'Please provide studentId, academicYear, amount, dueDate, items, and ensure user is authenticated.' });
    }
    try {
        if (!mongoose_1.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid student ID format' });
        }
        if (!mongoose_1.Types.ObjectId.isValid(institutionId)) {
            return res.status(400).json({ message: 'Invalid institution ID format' });
        }
        const studentExists = await Student_1.default.findOne({ _id: studentId, institutionId: new mongoose_1.Types.ObjectId(institutionId) });
        if (!studentExists) {
            return res.status(404).json({ message: 'Student not found or not in this institution.' });
        }
        const newFeeBill = new FeeBill_1.default({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            academicYear,
            amount,
            dueDate: new Date(dueDate),
            issueDate: new Date(),
            items,
            status: 'pending',
        });
        const feeBill = await newFeeBill.save();
        res.status(201).json({
            message: 'Fee bill created successfully',
            feeBill,
        });
    }
    catch (error) {
        console.error('Error creating fee bill:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createFeeBill = createFeeBill;
const getFeeBills = async (req, res) => {
    const institutionId = req.user?.institutionId;
    const { studentId, academicYear, status } = req.query; // Filters
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        const query = { institutionId: new mongoose_1.Types.ObjectId(institutionId) };
        if (studentId) {
            if (!mongoose_1.Types.ObjectId.isValid(studentId)) {
                return res.status(400).json({ message: 'Invalid student ID format' });
            }
            query.studentId = new mongoose_1.Types.ObjectId(studentId);
        }
        if (academicYear)
            query.academicYear = parseInt(academicYear);
        if (status)
            query.status = status;
        const feeBills = await FeeBill_1.default.find(query)
            .populate('studentId', 'name generatedId')
            .sort({ dueDate: 1 }); // Sort by due date ascending
        res.status(200).json(feeBills);
    }
    catch (error) {
        console.error('Error fetching fee bills:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getFeeBills = getFeeBills;
// You might also add updateFeeBillStatus, deleteFeeBill, etc. later
