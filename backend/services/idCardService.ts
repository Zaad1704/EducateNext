import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import IDCard from '../models/IDCard';
import { generateQRData } from './qrService';
import { Types } from 'mongoose';

export const generateIDCard = async (
  userId: string,
  userType: 'student' | 'teacher',
  institutionId: string,
  userData: any
) => {
  try {
    // Generate QR code for the user
    const qrData = await generateQRData(userId, userType, institutionId);
    const qrCodeImage = await QRCode.toDataURL(qrData);
    
    // Generate unique card number
    const cardNumber = await generateCardNumber(institutionId, userType);
    
    // Create ID card record
    const idCard = new IDCard({
      userId: new Types.ObjectId(userId),
      userType,
      institutionId: new Types.ObjectId(institutionId),
      cardNumber,
      qrCodeId: userData.qrCodeId,
      template: userType === 'student' ? 'student' : 'teacher',
      cardData: {
        name: userData.name,
        photo: userData.photo || '/default-avatar.png',
        id: userData.generatedId || userData.employeeId,
        institution: userData.institutionName,
        validFrom: new Date(),
        validUntil: getCardExpiryDate(),
        emergencyContact: userData.emergencyContact,
        department: userData.department,
        class: userData.className,
      },
    });

    await idCard.save();
    return idCard;

  } catch (error) {
    console.error('Error generating ID card:', error);
    throw error;
  }
};

export const generateCardPDF = async (cardId: string) => {
  try {
    const card = await IDCard.findById(cardId).populate('institutionId');
    if (!card) throw new Error('Card not found');

    const qrCodeImage = await QRCode.toDataURL(card.qrCodeId.toString());
    
    const htmlTemplate = generateCardHTML(card, qrCodeImage);
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setContent(htmlTemplate);
    await page.setViewport({ width: 1080, height: 1920 });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    
    await browser.close();
    
    return pdfBuffer;

  } catch (error) {
    console.error('Error generating card PDF:', error);
    throw error;
  }
};

export const generateDigitalWalletPass = async (cardId: string) => {
  try {
    const card = await IDCard.findById(cardId);
    if (!card) throw new Error('Card not found');

    // Apple Wallet pass structure
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.educatenext.studentid',
      serialNumber: card.cardNumber,
      teamIdentifier: 'EDUCATENEXT',
      organizationName: card.cardData.institution,
      description: `${card.userType} ID Card`,
      logoText: card.cardData.institution,
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(60, 130, 246)',
      generic: {
        primaryFields: [
          {
            key: 'name',
            label: 'Name',
            value: card.cardData.name
          }
        ],
        secondaryFields: [
          {
            key: 'id',
            label: 'ID',
            value: card.cardData.id
          },
          {
            key: 'valid',
            label: 'Valid Until',
            value: card.cardData.validUntil.toLocaleDateString()
          }
        ]
      },
      barcode: {
        message: card.qrCodeId.toString(),
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      }
    };

    return passData;

  } catch (error) {
    console.error('Error generating wallet pass:', error);
    throw error;
  }
};

const generateCardNumber = async (institutionId: string, userType: string): Promise<string> => {
  const prefix = userType === 'student' ? 'STU' : 'TEA';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

const getCardExpiryDate = (): Date => {
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry;
};

const generateCardHTML = (card: any, qrCodeImage: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .card { 
          width: 350px; 
          height: 220px; 
          border: 2px solid #3B82F6; 
          border-radius: 15px; 
          padding: 20px; 
          background: linear-gradient(135deg, #3B82F6, #1E40AF);
          color: white;
          position: relative;
        }
        .header { text-align: center; margin-bottom: 15px; }
        .logo { font-size: 18px; font-weight: bold; }
        .content { display: flex; align-items: center; }
        .photo { 
          width: 80px; 
          height: 80px; 
          border-radius: 50%; 
          margin-right: 15px;
          background: white;
        }
        .info { flex: 1; }
        .name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .details { font-size: 12px; line-height: 1.4; }
        .qr { 
          position: absolute; 
          bottom: 15px; 
          right: 15px; 
          width: 60px; 
          height: 60px;
        }
        .card-number { 
          position: absolute; 
          bottom: 5px; 
          left: 20px; 
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">${card.cardData.institution}</div>
          <div style="font-size: 12px;">${card.userType.toUpperCase()} ID CARD</div>
        </div>
        <div class="content">
          <img src="${card.cardData.photo}" class="photo" alt="Photo">
          <div class="info">
            <div class="name">${card.cardData.name}</div>
            <div class="details">
              ID: ${card.cardData.id}<br>
              ${card.cardData.class ? `Class: ${card.cardData.class}<br>` : ''}
              ${card.cardData.department ? `Dept: ${card.cardData.department}<br>` : ''}
              Valid: ${card.cardData.validUntil.toLocaleDateString()}
            </div>
          </div>
        </div>
        <img src="${qrCodeImage}" class="qr" alt="QR Code">
        <div class="card-number">${card.cardNumber}</div>
      </div>
    </body>
    </html>
  `;
};