/**
 * Mock email and SMS senders.
 * In production replace with real providers
 * (e.g. SendGrid for email, Twilio/AfricasTalking for SMS).
 */
export const notificationMock = {
  async sendEmailVerification(
    email: string,
    code: string
  ): Promise<void> {
    console.log(`[EMAIL MOCK] To: ${email} | Subject: Verify your EACRMS account`);
    console.log(`[EMAIL MOCK] Your verification code is: ${code}`);
    console.log(`[EMAIL MOCK] This code expires in 24 hours.`);
  },

  async sendPhoneOtp(
    phoneNumber: string,
    otp: string
  ): Promise<void> {
    console.log(`[SMS MOCK] To: ${phoneNumber} | Your EACRMS phone verification OTP is: ${otp}`);
    console.log(`[SMS MOCK] This OTP expires in 10 minutes.`);
  },
};
