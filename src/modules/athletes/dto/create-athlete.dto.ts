import { Gender, DominantHand, DominantFoot, BloodType, RegistrationSource } from "@prisma/client"

export interface CreateAthleteDTO {

    firstName: string;

    lastName: string;

    email: string;

    password: string;

    phoneNumber?: string;

    dateOfBirth: Date;

    gender: Gender;

    nationality: string;

    sportId?: string;

    clubId?: string;

    position?: string;

    height?: number;

    weight?: number;

    dominantHand?: DominantHand;

    dominantFoot?: DominantFoot;

    bloodType?: BloodType;

    // set by the service, not directly by the user
    registrationSource?: RegistrationSource;

    registeredById?: string;

}