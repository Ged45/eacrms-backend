import { Gender, DominantHand, DominantFoot, BloodType, RegistrationSource } from "@prisma/client"

export interface CreateAthleteDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    faydaVerificationToken?: string;
    fanNumber?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    nationality?: string;
    sportIds?: string[];
    sportId?: string;
    clubId?: string;
    clubName?: string;
    region?: string;
    emergencyContactPhone?: string;
    position?: string;
    height?: number;
    weight?: number;
    dominantHand?: DominantHand;
    dominantFoot?: DominantFoot;
    bloodType?: BloodType;
    registrationSource?: RegistrationSource;
    registeredById?: string;
}

export type AthleteRegistrationInput = Required<Pick<CreateAthleteDTO,
    "firstName" |
    "lastName" |
    "email" |
    "password" |
    "dateOfBirth" |
    "gender" |
    "nationality"
>> & Omit<CreateAthleteDTO,
    "firstName" |
    "lastName" |
    "email" |
    "password" |
    "dateOfBirth" |
    "gender" |
    "nationality"
>;