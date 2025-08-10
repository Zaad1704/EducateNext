"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkGenerateCards = exports.updatePrintStatus = exports.addToWallet = exports.downloadIDCard = exports.getIDCard = exports.createIDCard = void 0;
const IDCard_1 = __importDefault(require("../models/IDCard"));
const Student_1 = __importDefault(require("../models/Student"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
const idCardService_1 = require("../services/idCardService");
const mongoose_1 = require("mongoose");
const createIDCard = async (req, res) => {
    const { userId, userType } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        // Check if ID card already exists
        const existingCard = await IDCard_1.default.findOne({
            userId: new mongoose_1.Types.ObjectId(userId),
            userType,
        });
        if (existingCard) {
            return res.status(400).json({ message: 'ID card already exists for this user' });
        }
        // Get user data
        let userData;
        if (userType === 'student') {
            userData = await Student_1.default.findById(userId).populate('classroomId institutionId');
        }
        else {
            userData = await Teacher_1.default.findById(userId).populate('userId institutionId');
        }
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        const idCard = await (0, idCardService_1.generateIDCard)(userId, userType, institutionId, {
            name: userType === 'student' ? userData.name : userData.userId.name,
            photo: userData.photoUrl,
            generatedId: userData.generatedId,
            employeeId: userData.employeeId,
            institutionName: userData.institutionId.name,
            className: userData.classroomId?.name,
            department: userData.department,
            emergencyContact: userData.emergencyContacts?.[0]?.phone,
            qrCodeId: userData.qr?.qrCodeId,
        });
        res.status(201).json({
            message: 'ID card created successfully',
            idCard,
        });
    }
    catch (error) {
        console.error('Error creating ID card:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createIDCard = createIDCard;
const getIDCard = async (req, res) => {
    const { userId } = req.params;
    const { userType } = req.query;
    const institutionId = req.user?.institutionId;
    try {
        const idCard = await IDCard_1.default.findOne({
            userId: new mongoose_1.Types.ObjectId(userId),
            userType,
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
        }).populate('qrCodeId');
        if (!idCard) {
            return res.status(404).json({ message: 'ID card not found' });
        }
        res.status(200).json(idCard);
    }
    catch (error) {
        console.error('Error fetching ID card:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getIDCard = getIDCard;
const downloadIDCard = async (req, res) => {
    const { cardId } = req.params;
    const institutionId = req.user?.institutionId;
    try {
        const idCard = await IDCard_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(cardId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
        });
        if (!idCard) {
            return res.status(404).json({ message: 'ID card not found' });
        }
        const pdfBuffer = await (0, idCardService_1.generateCardPDF)(cardId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="id-card-${idCard.cardNumber}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error downloading ID card:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.downloadIDCard = downloadIDCard;
const addToWallet = async (req, res) => {
    const { cardId } = req.params;
    const institutionId = req.user?.institutionId;
    try {
        const idCard = await IDCard_1.default.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(cardId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
        }, { digitalWalletAdded: true }, { new: true });
        if (!idCard) {
            return res.status(404).json({ message: 'ID card not found' });
        }
        const walletPass = await (0, idCardService_1.generateDigitalWalletPass)(cardId);
        res.status(200).json({
            message: 'Digital wallet pass generated',
            walletPass,
        });
    }
    catch (error) {
        console.error('Error adding to wallet:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addToWallet = addToWallet;
const updatePrintStatus = async (req, res) => {
    const { cardId } = req.params;
    const { status } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        const idCard = await IDCard_1.default.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(cardId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
        }, { printStatus: status }, { new: true });
        if (!idCard) {
            return res.status(404).json({ message: 'ID card not found' });
        }
        res.status(200).json({
            message: 'Print status updated successfully',
            idCard,
        });
    }
    catch (error) {
        console.error('Error updating print status:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updatePrintStatus = updatePrintStatus;
const bulkGenerateCards = async (req, res) => {
    const { userIds, userType } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        const results = [];
        for (const userId of userIds) {
            try {
                // Get user data
                let userData;
                if (userType === 'student') {
                    userData = await Student_1.default.findById(userId).populate('classroomId institutionId');
                }
                else {
                    userData = await Teacher_1.default.findById(userId).populate('userId institutionId');
                }
                if (userData) {
                    const idCard = await (0, idCardService_1.generateIDCard)(userId, userType, institutionId, {
                        name: userType === 'student' ? userData.name : userData.userId.name,
                        photo: userData.photoUrl,
                        generatedId: userData.generatedId,
                        employeeId: userData.employeeId,
                        institutionName: userData.institutionId.name,
                        className: userData.classroomId?.name,
                        department: userData.department,
                        emergencyContact: userData.emergencyContacts?.[0]?.phone,
                        qrCodeId: userData.qr?.qrCodeId,
                    });
                    results.push({ userId, success: true, cardId: idCard._id });
                }
                else {
                    results.push({ userId, success: false, error: 'User not found' });
                }
            }
            catch (error) {
                results.push({ userId, success: false, error: error.message });
            }
        }
        res.status(200).json({
            message: 'Bulk ID card generation completed',
            results,
            successCount: results.filter(r => r.success).length,
            totalCount: results.length,
        });
    }
    catch (error) {
        console.error('Error in bulk generation:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.bulkGenerateCards = bulkGenerateCards;
