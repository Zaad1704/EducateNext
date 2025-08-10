"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendance = exports.markAttendance = void 0;
const AttendanceRecord_1 = __importDefault(require("../models/AttendanceRecord")); // Import AttendanceRecord model
const Student_1 = __importDefault(require("../models/Student")); // For validation
const Classroom_1 = __importDefault(require("../models/Classroom")); // For validation
const mongoose_1 = require("mongoose");
const markAttendance = async (req, res) => {
    const { studentId, classroomId, date, status, scanType, scanMethod, deviceId } = req.body;
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    if (!studentId || !classroomId || !date || !status || !institutionId || !teacherId) {
        return res.status(400).json({ message: 'Please provide all required fields and ensure user is authenticated.' });
    }
    // Validate status enum
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
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
        // Convert date to a Date object and normalize to start of day to prevent duplicate entries for same day
        const attendanceDate = new Date(date);
        attendanceDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC
        // Check if attendance record already exists for this student, classroom, and date
        const existingRecord = await AttendanceRecord_1.default.findOne({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            date: attendanceDate,
        });
        if (existingRecord) {
            // If record exists, update it
            existingRecord.status = status;
            await existingRecord.save();
            return res.status(200).json({
                message: 'Attendance record updated successfully',
                attendance: existingRecord,
            });
        }
        // If no record exists, create a new one
        const newRecord = new AttendanceRecord_1.default({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            date: attendanceDate,
            status,
        });
        const attendance = await newRecord.save();
        res.status(201).json({
            message: 'Attendance marked successfully',
            attendance: {
                id: attendance._id,
                studentId: attendance.studentId,
                classroomId: attendance.classroomId,
                date: attendance.date,
                status: attendance.status,
            },
        });
    }
    catch (error) {
        console.error('Error marking attendance:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.markAttendance = markAttendance;
const getAttendance = async (req, res) => {
    const institutionId = req.user?.institutionId; // Filter attendance by authenticated user's institution
    const { studentId, classroomId, startDate, endDate } = req.query; // Optional filters
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
        if (classroomId) {
            if (!mongoose_1.Types.ObjectId.isValid(classroomId)) {
                return res.status(400).json({ message: 'Invalid classroom ID format' });
            }
            query.classroomId = new mongoose_1.Types.ObjectId(classroomId);
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
                query.date.$gte.setUTCHours(0, 0, 0, 0); // Start of day
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
                query.date.$lte.setUTCHours(23, 59, 59, 999); // End of day
            }
        }
        const attendanceRecords = await AttendanceRecord_1.default.find(query)
            .populate('studentId', 'name generatedId')
            .populate('classroomId', 'name')
            .sort({ date: -1 }); // Sort by date descending
        res.status(200).json(attendanceRecords);
    }
    catch (error) {
        console.error('Error getting attendance records:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAttendance = getAttendance;
