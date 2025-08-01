import { Request, Response } from 'express';
import QRCode from '../models/QRCode';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import { generateQRData, validateQRData } from '../services/qrService';
import { Types } from 'mongoose';

export const generateQR = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { userType } = req.body;
  const institutionId = req.user?.institutionId;

  if (!userId || !userType || !institutionId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Validate user exists
    const userExists = userType === 'student' 
      ? await Student.findOne({ _id: userId, institutionId })
      : await Teacher.findOne({ userId, institutionId });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Deactivate existing QR
    await QRCode.updateMany(
      { userId: new Types.ObjectId(userId), userType },
      { isActive: false }
    );

    // Generate new QR
    const qrData = await generateQRData(userId, userType, institutionId);
    
    const newQR = new QRCode({
      userId: new Types.ObjectId(userId),
      userType,
      institutionId: new Types.ObjectId(institutionId),
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

  } catch (error: any) {
    console.error('Error generating QR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const validateQR = async (req: Request, res: Response) => {
  const { qrData } = req.params;
  const institutionId = req.user?.institutionId;

  try {
    const qrRecord = await QRCode.findOne({ 
      qrData, 
      isActive: true,
      institutionId: new Types.ObjectId(institutionId)
    }).populate('userId');

    if (!qrRecord) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    // Validate QR data integrity
    const isValid = await validateQRData(qrData, qrRecord.userId.toString(), qrRecord.userType, institutionId);
    
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

  } catch (error: any) {
    console.error('Error validating QR:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};