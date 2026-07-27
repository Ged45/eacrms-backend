import {Gender, DominantHand, DominantFoot, BloodType} from "@prisma/client"

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

}