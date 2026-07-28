import { FaydaDemographicData } from "./fayda.types";

/**
 * Mock eSignet gateway.
 *
 * In production this would be replaced by real HTTP calls to
 * Fayda's eSignet API (OpenID Connect / OAuth 2.0).
 */
export const faydaMockGateway = {
  /**
   * Simulate sending an OTP to the phone number
   * registered with the given NIN.
   * Returns the OTP so the mock can store it.
   */
  async sendOtp(nin: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[FAYDA MOCK] OTP for NIN ${nin}: ${otp}`);
    return otp;
  },

  /**
   * Simulate verifying an OTP against the Fayda gateway
   * and returning demographic data for the NIN.
   *
   * In the mock, any OTP that matches the stored value is accepted
   * and fake demographic data is returned based on the NIN.
   */
  async verifyOtpAndGetData(nin: string): Promise<FaydaDemographicData> {
    // Deterministic fake data derived from the NIN for repeatability
    return {
      nin,
      firstName:   "Fayda",
      lastName:    "Verified",
      dateOfBirth: "1995-01-01",
      gender:      "MALE",
      phoneNumber: "+251911000000",
    };
  },
};
