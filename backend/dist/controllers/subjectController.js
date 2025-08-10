"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSubjects = exports.createSubject = void 0;
const Subject_1 = __importDefault(require("../models/Subject")); // Import Subject model
const mongoose_1 = require("mongoose");
const createSubject = async (req, res) => {
    const { name } = req.body;
    const institutionId = req.user?.institutionId; // Get institutionId from authenticated user
    if (!name || !institutionId) {
        return res.status(400).json({ message: 'Please enter subject name and ensure user is authenticated.' });
    }
    try {
        // Check if subject with this name already exists for this institution
        const existingSubject = await Subject_1.default.findOne({ name, institutionId: new mongoose_1.Types.ObjectId(institutionId) });
        if (existingSubject) {
            return res.status(400).json({ message: 'Subject with this name already exists for this institution.' });
        }
        const newSubject = new Subject_1.default({
            name,
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
        });
        const subject = await newSubject.save();
        res.status(201).json({
            message: 'Subject created successfully',
            subject: {
                id: subject._id,
                name: subject.name,
                institutionId: subject.institutionId,
            },
        });
    }
    catch (error) {
        console.error('Error creating subject:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createSubject = createSubject;
const listSubjects = async (req, res) => {
    const institutionId = req.user?.institutionId; // Filter subjects by authenticated user's institution
    if (!institutionId) {
        return res.status(401).json({ message: 'Not authorized: Institution ID not found in token.' });
    }
    try {
        const subjects = await Subject_1.default.find({ institutionId: new mongoose_1.Types.ObjectId(institutionId) });
        res.status(200).json(subjects);
    }
    catch (error) {
        console.error('Error listing subjects:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.listSubjects = listSubjects;
