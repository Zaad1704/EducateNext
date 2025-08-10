"use strict";
// backend/services/smsService.ts
// This is a placeholder. For actual implementation, you'd integrate with an SMS Gateway Provider
// like Twilio (requires installation: npm install twilio)
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = sendSms;
exports.sendAbsenceAlert = sendAbsenceAlert;
exports.sendFeeReminder = sendFeeReminder;
// Example Twilio client (replace with your actual Twilio account SID and auth token)
/*
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
*/
async function sendSms(options) {
    // Replace this with actual SMS sending logic using your chosen provider's SDK.
    // Make sure to configure your .env file with TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, etc.
    const defaultFrom = process.env.TWILIO_PHONE_NUMBER || '+1234567890'; // Your Twilio phone number
    try {
        console.log(`[SMSService] Attempting to send SMS to: ${options.to}`);
        console.log(`Message: ${options.body.substring(0, 100)}...`); // Log snippet of message
        // Example with a placeholder log instead of actual sending
        // In a real implementation:
        /*
        await twilioClient.messages.create({
          to: options.to,
          from: options.from || defaultFrom,
          body: options.body,
        });
        */
        console.log('[SMSService] SMS sending simulated successfully.');
    }
    catch (error) {
        console.error('[SMSService] Failed to send SMS:', error);
        throw new Error('Failed to send SMS.'); // Re-throw to be caught by controller
    }
}
// Example usage functions (you can add more as needed)
async function sendAbsenceAlert(toPhoneNumber, studentName, className, date) {
    const message = `Alert: ${studentName} was marked absent from ${className} on ${date}.`;
    await sendSms({ to: toPhoneNumber, body: message });
}
async function sendFeeReminder(toPhoneNumber, studentName, amount, dueDate) {
    const message = `Reminder: Fee of ${amount} for ${studentName} is due by ${dueDate}.`;
    await sendSms({ to: toPhoneNumber, body: message });
}
