"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkGenerateReports = exports.publishReportCard = exports.getReportCards = exports.createReportCard = void 0;
const ReportCard_1 = __importDefault(require("../models/ReportCard"));
const Student_1 = __importDefault(require("../models/Student"));
const reportCardService_1 = require("../services/reportCardService");
const mongoose_1 = require("mongoose");
const createReportCard = async (req, res) => {
    const { studentId, academicYear, semester } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        // Check if report card already exists
        const existingReport = await ReportCard_1.default.findOne({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            academicYear,
            semester,
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
        });
        if (existingReport) {
            return res.status(400).json({ message: 'Report card already exists for this period' });
        }
        const reportCard = await (0, reportCardService_1.generateReportCard)(studentId, academicYear, semester, institutionId);
        res.status(201).json({
            message: 'Report card generated successfully',
            reportCard,
        });
    }
    catch (error) {
        console.error('Error creating report card:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createReportCard = createReportCard;
const getReportCards = async (req, res) => {
    const { studentId, academicYear, semester } = req.query;
    const institutionId = req.user?.institutionId;
    try {
        const query = { institutionId: new mongoose_1.Types.ObjectId(institutionId) };
        if (studentId)
            query.studentId = new mongoose_1.Types.ObjectId(studentId);
        if (academicYear)
            query.academicYear = academicYear;
        if (semester)
            query.semester = semester;
        const reportCards = await ReportCard_1.default.find(query)
            .populate('studentId', 'name generatedId')
            .populate('classroomId', 'name')
            .populate('subjects.subjectId', 'name code')
            .sort({ generatedAt: -1 });
        res.status(200).json(reportCards);
    }
    catch (error) {
        console.error('Error fetching report cards:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getReportCards = getReportCards;
const publishReportCard = async (req, res) => {
    const { reportCardId } = req.params;
    const { principalRemarks } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        const reportCard = await ReportCard_1.default.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(reportCardId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        }, {
            isPublished: true,
            principalRemarks: principalRemarks || '',
        }, { new: true });
        if (!reportCard) {
            return res.status(404).json({ message: 'Report card not found' });
        }
        res.status(200).json({
            message: 'Report card published successfully',
            reportCard,
        });
    }
    catch (error) {
        console.error('Error publishing report card:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.publishReportCard = publishReportCard;
const bulkGenerateReports = async (req, res) => {
    const { classroomId, academicYear, semester } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        // Get all students in the classroom
        const students = await Student_1.default.find({
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        });
        const reportPromises = students.map(student => (0, reportCardService_1.generateReportCard)(student._id.toString(), academicYear, semester, institutionId));
        const reportCards = await Promise.all(reportPromises);
        res.status(201).json({
            message: 'Bulk report cards generated successfully',
            count: reportCards.length,
            reportCards,
        });
    }
    catch (error) {
        console.error('Error generating bulk report cards:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.bulkGenerateReports = bulkGenerateReports;
