// backend/services/emailService.ts
// This is a placeholder. For actual implementation, you'd integrate with an Email Service Provider (ESP)
// like SendGrid, Mailgun, or use Nodemailer with your chosen SMTP provider.

// Example: Using Nodemailer (requires installation: npm install nodemailer @types/nodemailer)
// import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string; // Optional: sender email, defaults to config
}

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

export async function sendEmail(options: EmailOptions): Promise<void> {
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

  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    throw new Error('Failed to send email.'); // Re-throw to be caught by controller
  }
}

// Example usage functions (you can add more as needed)
export async function sendWelcomeEmail(toEmail: string, userName: string): Promise<void> {
  const subject = 'Welcome to EducateNext!';
  const text = `Dear ${userName},\n\nWelcome to EducateNext, your comprehensive school management platform! We're excited to have you on board.\n\nBest regards,\nThe EducateNext Team`;
  const html = `<p>Dear <strong>${userName}</strong>,</p><p>Welcome to EducateNext, your comprehensive school management platform! We're excited to have you on board.</p><p>Best regards,<br>The EducateNext Team</p>`;
  await sendEmail({ to: toEmail, subject, text, html });
}

export async function sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<void> {
  const subject = 'EducateNext - Password Reset Request';
  const text = `You requested a password reset. Please use the following link to reset your password: ${resetLink}. This link will expire in [time].`;
  const html = `<p>You requested a password reset. Please click <a href="${resetLink}">here</a> to reset your password.</p><p>This link will expire in [time].</p>`;
  await sendEmail({ to: toEmail, subject, text, html });
}
