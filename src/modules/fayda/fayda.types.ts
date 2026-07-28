export interface InitiateVerificationDTO {
  nin: string;           // Fayda National ID Number
  athleteId?: string;
  coachId?: string;
}

export interface ConfirmVerificationDTO {
  verificationId: string;
  otp: string;
}

// Shape of data the mock eSignet gateway returns after successful OTP
export interface FaydaDemographicData {
  nin: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;   // ISO date string
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
}
