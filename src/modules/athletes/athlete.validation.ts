import { z } from "zod";

export const createAthleteSchema =
z.object({

    firstName:
        z.string().min(2).max(50),

    lastName:
        z.string().min(2).max(50),

    email:
        z.string().email(),

    password:
        z.string().min(8),

    phoneNumber:
        z.string().optional(),

    dateOfBirth:
        z.coerce.date(),

    gender:
        z.enum([
            "MALE",
            "FEMALE",
        ]),

    nationality:
        z.string().min(2),

    sportId:
        z.string().optional(),

    clubId:
        z.string().optional(),

    position:
        z.string().optional(),

    height:
        z.number().min(40).max(250).optional(),

    weight:
        z.number().min(10).max(400).optional(),

    dominantHand:
        z.enum([
            "LEFT",
            "RIGHT",
            "AMBIDEXTROUS",
        ]).optional(),

    dominantFoot:
        z.enum([
            "LEFT",
            "RIGHT",
            "BOTH",
        ]).optional(),

    bloodType:
        z.enum([
            "A_POSITIVE",
            "A_NEGATIVE",
            "B_POSITIVE",
            "B_NEGATIVE",
            "AB_POSITIVE",
            "AB_NEGATIVE",
            "O_POSITIVE",
            "O_NEGATIVE",
        ]).optional(),

});