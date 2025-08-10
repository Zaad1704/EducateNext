"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionHistory = exports.getActiveSessions = exports.scanQRAttendance = exports.endAttendanceSession = exports.startAttendanceSession = void 0;
const AttendanceSession_1 = __importDefault(require("../models/AttendanceSession"));
const AttendanceRecord_1 = __importDefault(require("../models/AttendanceRecord"));
const mongoose_1 = require("mongoose");
const startAttendanceSession = async (req, res) => {
    const { classroomId, sessionType } = req.body;
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    try {
        // Check if there's already an active session
        const activeSession = await AttendanceSession_1.default.findOne({
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            isActive: true,
        });
        if (activeSession) {
            return res.status(400).json({ message: 'An active session already exists for this class' });
        }
        const session = new AttendanceSession_1.default({
            classroomId: new mongoose_1.Types.ObjectId(classroomId),
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            sessionType: sessionType || 'class_start',
            date: new Date(),
            startTime: new Date(),
            isActive: true,
            attendanceRecords: [],
        });
        await session.save();
        res.status(201).json({
            message: 'Attendance session started successfully',
            session,
        });
    }
    catch (error) {
        console.error('Error starting attendance session:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.startAttendanceSession = startAttendanceSession;
const endAttendanceSession = async (req, res) => {
    const { sessionId } = req.params;
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    try {
        const session = await AttendanceSession_1.default.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(sessionId),
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            isActive: true,
        }, {
            endTime: new Date(),
            isActive: false,
        }, { new: true });
        if (!session) {
            return res.status(404).json({ message: 'Active session not found' });
        }
        res.status(200).json({
            message: 'Attendance session ended successfully',
            session,
        });
    }
    catch (error) {
        console.error('Error ending attendance session:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.endAttendanceSession = endAttendanceSession;
const scanQRAttendance = async (req, res) => {
    const { qrData, sessionId, deviceId } = req.body;
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    try {
        // Validate QR code and get user info
        const qrValidation = await validateQRCode(qrData, institutionId);
        if (!qrValidation.valid) {
            return res.status(400).json({ message: 'Invalid QR code' });
        }
        // Get active session
        const session = await AttendanceSession_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(sessionId),
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            isActive: true,
        });
        if (!session) {
            return res.status(404).json({ message: 'No active session found' });
        }
        // Check if attendance already recorded for this session
        const existingRecord = await AttendanceRecord_1.default.findOne({
            studentId: new mongoose_1.Types.ObjectId(qrValidation.userId),
            sessionId: new mongoose_1.Types.ObjectId(sessionId),
            scanType: session.sessionType,
        });
        if (existingRecord) {
            return res.status(400).json({ message: 'Attendance already recorded for this session' });
        }
        // Create attendance record
        const attendanceRecord = new AttendanceRecord_1.default({
            studentId: new mongoose_1.Types.ObjectId(qrValidation.userId),
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            classroomId: session.classroomId,
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            sessionId: new mongoose_1.Types.ObjectId(sessionId),
            date: session.date,
            scanTime: new Date(),
            status: 'present',
            scanType: session.sessionType,
            scanMethod: 'qr_scan',
            deviceId,
            isVerified: true,
        });
        await attendanceRecord.save();
        // Update session with attendance record
        await AttendanceSession_1.default.findByIdAndUpdate(sessionId, {
            $push: { attendanceRecords: attendanceRecord._id }
        });
        res.status(201).json({
            message: 'Attendance recorded successfully',
            attendanceRecord,
            studentInfo: qrValidation.userInfo,
        });
    }
    catch (error) {
        console.error('Error scanning QR attendance:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.scanQRAttendance = scanQRAttendance;
const getActiveSessions = async (req, res) => {
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    try {
        const sessions = await AttendanceSession_1.default.find({
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            isActive: true,
        })
            .populate('classroomId', 'name')
            .populate('attendanceRecords')
            .sort({ startTime: -1 });
        res.status(200).json(sessions);
    }
    catch (error) {
        console.error('Error fetching active sessions:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getActiveSessions = getActiveSessions;
const getSessionHistory = async (req, res) => {
    const { classroomId, startDate, endDate } = req.query;
    const teacherId = req.user?.id;
    const institutionId = req.user?.institutionId;
    try {
        const query = {
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
        };
        if (classroomId)
            query.classroomId = new mongoose_1.Types.ObjectId(classroomId);
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = new Date(startDate);
            if (endDate)
                query.date.$lte = new Date(endDate);
        }
        const sessions = await AttendanceSession_1.default.find(query)
            .populate('classroomId', 'name')
            .populate({
            path: 'attendanceRecords',
            populate: {
                path: 'studentId',
                select: 'name generatedId'
            }
        })
            .sort({ date: -1, startTime: -1 });
        res.status(200).json(sessions);
    }
    catch (error) {
        console.error('Error fetching session history:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getSessionHistory = getSessionHistory;
// Helper function to validate QR code
const validateQRCode = async (qrData, institutionId) => {
    try {
        // This would integrate with your QR validation service
        // For now, returning mock validation
        return {
            valid: true,
            userId: new mongoose_1.Types.ObjectId().toString(),
            userType: 'student',
            userInfo: {
                name: 'John Doe',
                id: 'STU001',
            }
        };
    }
    catch (error) {
        return { valid: false };
    }
};
