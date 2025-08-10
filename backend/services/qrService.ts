import crypto from 'crypto';
import QRCode from 'qrcode';

const QR_SECRET = process.env.QR_SECRET || 'default-secret-key';

export const generateQRData = async (userId: string, userType: string, institutionId: string): Promise<string> => {
  const timestamp = Date.now();
  const data = `${userId}:${userType}:${institutionId}:${timestamp}`;
  
  // Create HMAC signature
  const signature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(data)
    .digest('hex');
  
  const qrPayload = `${data}:${signature}`;
  return Buffer.from(qrPayload).toString('base64');
};

export const validateQRData = async (qrData: string, userId: string, userType: string, institutionId: string): Promise<boolean> => {
  try {
    const decoded = Buffer.from(qrData, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 5) return false;
    
    const [qrUserId, qrUserType, qrInstitutionId, qrTimestamp, signature] = parts;
    
    // Verify data matches
    if (qrUserId !== userId || qrUserType !== userType || qrInstitutionId !== institutionId) {
      return false;
    }
    
    // Verify signature
    const data = `${qrUserId}:${qrUserType}:${qrInstitutionId}:${qrTimestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', QR_SECRET)
      .update(data)
      .digest('hex');
    
    if (signature !== expectedSignature) return false;
    
    // Check expiration (24 hours)
    const timestamp = parseInt(qrTimestamp);
    const now = Date.now();
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
    
    return (now - timestamp) < expiryTime;
    
  } catch (error) {
    return false;
  }
};

export const generateQRImage = async (qrData: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    throw new Error('Failed to generate QR image');
  }
};