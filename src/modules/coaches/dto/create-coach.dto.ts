import { RegistrationSource } from "@prisma/client";

export interface CreateCoachDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  sportId?: string;
  clubId?: string;
  licenseNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
  // set by the service, not the user
  registrationSource?: RegistrationSource;
  registeredById?: string;
}
