import { Request, Response } from "express";
import { athleteRepository } from "../athletes/athlete.repository";
import { asyncHandler } from "../../middleware/asyncHandler";

export const metaController = {
  /**
   * GET /meta/registration-options
   *
   * Returns dropdown data for athlete self-registration:
   * - disciplines (sports)
   * - clubs (verified only)
   * - regions (derived from clubs)
   */
  getRegistrationOptions: asyncHandler(async (_req: Request, res: Response) => {
    const [disciplines, clubs, regions] = await Promise.all([
      athleteRepository.findAllSports(),
      athleteRepository.findAllClubs(),
      athleteRepository.findDistinctRegions(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        disciplines,
        clubs,
        regions,
      },
    });
  }),
};
