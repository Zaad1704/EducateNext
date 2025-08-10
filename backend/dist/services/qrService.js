"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRImage = exports.validateQRData = exports.generateQRData = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
const QR_SECRET = process.env.QR_SECRET || 'default-secret-key';
const generateQRData = async (userId, userType, institutionId) => {
    const timestamp = Date.now();
    const data = `${userId}:${userType}:${institutionId}:${timestamp}`;
    // Create HMAC signature
    const signature = crypto_1.default
        .createHmac('sha256', QR_SECRET)
        .update(data)
        .digest('hex');
    const qrPayload = `${data}:${signature}`;
    return Buffer.from(qrPayload).toString('base64');
};
exports.generateQRData = generateQRData;
const validateQRData = async (qrData, userId, userType, institutionId) => {
    try {
        const decoded = Buffer.from(qrData, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length !== 5)
            return false;
        const [qrUserId, qrUserType, qrInstitutionId, qrTimestamp, signature] = parts;
        // Verify data matches
        if (qrUserId !== userId || qrUserType !== userType || qrInstitutionId !== institutionId) {
            return false;
        }
        // Verify signature
        const data = `${qrUserId}:${qrUserType}:${qrInstitutionId}:${qrTimestamp}`;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', QR_SECRET)
            .update(data)
            .digest('hex');
        if (signature !== expectedSignature)
            return false;
        // Check expiration (24 hours)
        const timestamp = parseInt(qrTimestamp);
        const now = Date.now();
        const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
        return (now - timestamp) < expiryTime;
    }
    catch (error) {
        return false;
    }
};
exports.validateQRData = validateQRData;
const generateQRImage = async (qrData) => {
    try {
        return await qrcode_1.default.toDataURL(qrData, {
            errorCorrectionLevel: 'M',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    }
    catch (error) {
        throw new Error('Failed to generate QR image');
    }
};
exports.generateQRImage = generateQRImage;
