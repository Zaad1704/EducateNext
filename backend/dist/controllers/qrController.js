"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQR = exports.generateQR = void 0;
const QRCode_1 = __importDefault(require("../models/QRCode"));
const Student_1 = __importDefault(require("../models/Student"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
const qrService_1 = require("../services/qrService");
const mongoose_1 = require("mongoose");
const generateQR = async (req, res) => {
    const { userId } = req.params;
    const { userType } = req.body;
    const institutionId = req.user?.institutionId;
    if (!userId || !userType || !institutionId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        // Validate user exists
        const userExists = userType === 'student'
            ? await Student_1.default.findOne({ _id: userId, institutionId })
            : await Teacher_1.default.findOne({ userId, institutionId });
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Deactivate existing QR
        await QRCode_1.default.updateMany({ userId: new mongoose_1.Types.ObjectId(userId), userType }, { isActive: false });
        // Generate new QR
        const qrData = await (0, qrService_1.generateQRData)(userId, userType, institutionId);
        const newQR = new QRCode_1.default({
            userId: new mongoose_1.Types.ObjectId(userId),
            userType,
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            qrData,
            isActive: true,
            generatedAt: new Date(),
            regenerationCount: 0,
        });
        await newQR.save();
        res.status(201).json({
            message: 'QR code generated successfully',
            qrCode: {
                id: newQR._id,
                qrData: newQR.qrData,
                generatedAt: newQR.generatedAt,
            },
        });
    }
    catch (error) {
        console.error('Error generating QR:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.generateQR = generateQR;
const validateQR = async (req, res) => {
    const { qrData } = req.params;
    const institutionId = req.user?.institutionId;
    try {
        const qrRecord = await QRCode_1.default.findOne({
            qrData,
            isActive: true,
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        }).populate('userId');
        if (!qrRecord) {
            return res.status(404).json({ message: 'Invalid or expired QR code' });
        }
        // Validate QR data integrity
        const isValid = await (0, qrService_1.validateQRData)(qrData, qrRecord.userId.toString(), qrRecord.userType, institutionId);
        if (!isValid) {
            return res.status(400).json({ message: 'QR code validation failed' });
        }
        res.status(200).json({
            valid: true,
            user: {
                id: qrRecord.userId,
                type: qrRecord.userType,
            },
            qrCode: {
                id: qrRecord._id,
                generatedAt: qrRecord.generatedAt,
            },
        });
    }
    catch (error) {
        console.error('Error validating QR:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.validateQR = validateQR;
