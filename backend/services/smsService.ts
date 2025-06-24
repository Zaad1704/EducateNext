// backend/services/smsService.ts
// This is a placeholder. For actual implementation, you'd integrate with an SMS Gateway Provider
// like Twilio (requires installation: npm install twilio)

// Example: Using Twilio
// import twilio from 'twilio';

interface SmsOptions {
  to: string; // Recipient phone number (e.g., '+1234567890')
  body: string;
  from?: string; // Optional: Twilio phone number, defaults to config
}

// Example Twilio client (replace with your actual Twilio account SID and auth token)
/*
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
*/

export async function sendSms(options: SmsOptions): Promise<void> {
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

  } catch (error) {
    console.error('[SMSService] Failed to send SMS:', error);
    throw new Error('Failed to send SMS.'); // Re-throw to be caught by controller
  }
}

// Example usage functions (you can add more as needed)
export async function sendAbsenceAlert(toPhoneNumber: string, studentName: string, className: string, date: string): Promise<void> {
  const message = `Alert: ${studentName} was marked absent from ${className} on ${date}.`;
  await sendSms({ to: toPhoneNumber, body: message });
}

export async function sendFeeReminder(toPhoneNumber: string, studentName: string, amount: number, dueDate: string): Promise<void> {
  const message = `Reminder: Fee of ${amount} for ${studentName} is due by ${dueDate}.`;
  await sendSms({ to: toPhoneNumber, body: message });
}
