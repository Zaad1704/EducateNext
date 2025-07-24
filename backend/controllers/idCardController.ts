import { Request, Response } from 'express';
import IDCard from '../models/IDCard';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import { generateIDCard, generateCardPDF, generateDigitalWalletPass } from '../services/idCardService';
import { Types } from 'mongoose';

export const createIDCard = async (req: Request, res: Response) => {
  const { userId, userType } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    // Check if ID card already exists
    const existingCard = await IDCard.findOne({
      userId: new Types.ObjectId(userId),
      userType,
    });

    if (existingCard) {
      return res.status(400).json({ message: 'ID card already exists for this user' });
    }

    // Get user data
    let userData;
    if (userType === 'student') {
      userData = await Student.findById(userId).populate('classroomId institutionId');
    } else {
      userData = await Teacher.findById(userId).populate('userId institutionId');
    }

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const idCard = await generateIDCard(userId, userType, institutionId, {
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

  } catch (error: any) {
    console.error('Error creating ID card:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getIDCard = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { userType } = req.query;
  const institutionId = req.user?.institutionId;

  try {
    const idCard = await IDCard.findOne({
      userId: new Types.ObjectId(userId),
      userType,
      institutionId: new Types.ObjectId(institutionId),
    }).populate('qrCodeId');

    if (!idCard) {
      return res.status(404).json({ message: 'ID card not found' });
    }

    res.status(200).json(idCard);

  } catch (error: any) {
    console.error('Error fetching ID card:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const downloadIDCard = async (req: Request, res: Response) => {
  const { cardId } = req.params;
  const institutionId = req.user?.institutionId;

  try {
    const idCard = await IDCard.findOne({
      _id: new Types.ObjectId(cardId),
      institutionId: new Types.ObjectId(institutionId),
    });

    if (!idCard) {
      return res.status(404).json({ message: 'ID card not found' });
    }

    const pdfBuffer = await generateCardPDF(cardId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="id-card-${idCard.cardNumber}.pdf"`);
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('Error downloading ID card:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addToWallet = async (req: Request, res: Response) => {
  const { cardId } = req.params;
  const institutionId = req.user?.institutionId;

  try {
    const idCard = await IDCard.findOneAndUpdate(
      {
        _id: new Types.ObjectId(cardId),
        institutionId: new Types.ObjectId(institutionId),
      },
      { digitalWalletAdded: true },
      { new: true }
    );

    if (!idCard) {
      return res.status(404).json({ message: 'ID card not found' });
    }

    const walletPass = await generateDigitalWalletPass(cardId);

    res.status(200).json({
      message: 'Digital wallet pass generated',
      walletPass,
    });

  } catch (error: any) {
    console.error('Error adding to wallet:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePrintStatus = async (req: Request, res: Response) => {
  const { cardId } = req.params;
  const { status } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    const idCard = await IDCard.findOneAndUpdate(
      {
        _id: new Types.ObjectId(cardId),
        institutionId: new Types.ObjectId(institutionId),
      },
      { printStatus: status },
      { new: true }
    );

    if (!idCard) {
      return res.status(404).json({ message: 'ID card not found' });
    }

    res.status(200).json({
      message: 'Print status updated successfully',
      idCard,
    });

  } catch (error: any) {
    console.error('Error updating print status:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const bulkGenerateCards = async (req: Request, res: Response) => {
  const { userIds, userType } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    const results = [];
    
    for (const userId of userIds) {
      try {
        // Get user data
        let userData;
        if (userType === 'student') {
          userData = await Student.findById(userId).populate('classroomId institutionId');
        } else {
          userData = await Teacher.findById(userId).populate('userId institutionId');
        }

        if (userData) {
          const idCard = await generateIDCard(userId, userType, institutionId, {
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
        } else {
          results.push({ userId, success: false, error: 'User not found' });
        }
      } catch (error: any) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    res.status(200).json({
      message: 'Bulk ID card generation completed',
      results,
      successCount: results.filter(r => r.success).length,
      totalCount: results.length,
    });

  } catch (error: any) {
    console.error('Error in bulk generation:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};