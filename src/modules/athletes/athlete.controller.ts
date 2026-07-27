import { Request, Response } from "express";

import { athleteService } from "./athlete.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import  { CreateAthleteDTO } from "./dto/create-athlete.dto";

export class AthleteController {
  /**
   * Register Athlete
   * POST /api/v1/athletes/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await athleteService.register(
      req.body,
      req
    );

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.athlete,
    });
  });

  /**
   * Get Athlete By ID
   * GET /api/v1/athletes/:id
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const athlete = await athleteService.getById(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: athlete,
    });
  });

  /**
   * Get Logged-in Athlete Profile
   * GET /api/v1/athletes/profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const athlete = await athleteService.getByUserId(req.user.userId);

    return res.status(200).json({
      success: true,
      data: athlete,
    });
  });

  /**
   * Get All Athletes
   * GET /api/v1/athletes
   */
  findAll = asyncHandler(async (_req: Request, res: Response) => {
    const athletes = await athleteService.findAll();

    return res.status(200).json({
      success: true,
      data: athletes,
    });
  });

  /**
   * Search Athletes
   * GET /api/v1/athletes/search?search=gedion
   */
  search = asyncHandler(async (req: Request, res: Response) => {
    const search = (req.query.search as string) || "";

    const athletes = await athleteService.search(search);

    return res.status(200).json({
      success: true,
      data: athletes,
    });
  });

  /**
   * Get Athletes By Status
   * GET /api/v1/athletes/status/:status
   */
  findByStatus = asyncHandler(async (req: Request, res: Response) => {
    const athletes = await athleteService.findByStatus(
      req.params.status as any
    );

    return res.status(200).json({
      success: true,
      data: athletes,
    });
  });

  /**
   * Delete Athlete
   * DELETE /api/v1/athletes/:id
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const result = await athleteService.delete(req.params.id as string);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}

export const athleteController = new AthleteController();