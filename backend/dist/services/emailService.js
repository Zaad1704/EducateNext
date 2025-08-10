"use strict";
// backend/services/emailService.ts
// This is a placeholder. For actual implementation, you'd integrate with an Email Service Provider (ESP)
// like SendGrid, Mailgun, or use Nodemailer with your chosen SMTP provider.
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// Example transporter (replace with your actual ESP setup)
/*
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
*/
async function sendEmail(options) {
    // Replace this with actual email sending logic using your chosen ESP's SDK or Nodemailer.
    // Make sure to configure your .env file with EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, etc.
    const defaultFrom = process.env.EMAIL_FROM || 'noreply@educatenext.com'; // Default sender email
    try {
        console.log(`[EmailService] Attempting to send email to: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Text: ${options.text.substring(0, 100)}...`); // Log snippet of text
        // Example with a placeholder log instead of actual sending
        // In a real implementation:
        /*
        await transporter.sendMail({
          from: options.from || defaultFrom,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        */
        console.log('[EmailService] Email sending simulated successfully.');
    }
    catch (error) {
        console.error('[EmailService] Failed to send email:', error);
        throw new Error('Failed to send email.'); // Re-throw to be caught by controller
    }
}
// Example usage functions (you can add more as needed)
async function sendWelcomeEmail(toEmail, userName) {
    const subject = 'Welcome to EducateNext!';
    const text = `Dear ${userName},\n\nWelcome to EducateNext, your comprehensive school management platform! We're excited to have you on board.\n\nBest regards,\nThe EducateNext Team`;
    const html = `<p>Dear <strong>${userName}</strong>,</p><p>Welcome to EducateNext, your comprehensive school management platform! We're excited to have you on board.</p><p>Best regards,<br>The EducateNext Team</p>`;
    await sendEmail({ to: toEmail, subject, text, html });
}
async function sendPasswordResetEmail(toEmail, resetLink) {
    const subject = 'EducateNext - Password Reset Request';
    const text = `You requested a password reset. Please use the following link to reset your password: ${resetLink}. This link will expire in [time].`;
    const html = `<p>You requested a password reset. Please click <a href="${resetLink}">here</a> to reset your password.</p><p>This link will expire in [time].</p>`;
    await sendEmail({ to: toEmail, subject, text, html });
}
