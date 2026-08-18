import { Request, Response } from "express";

import { athleteService } from "./athlete.service";
import { faydaService } from "../fayda/fayda.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import { AthleteStatus } from "@prisma/client";
import { CreateAthleteDTO } from "./dto/create-athlete.dto";

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
   * Club Admin Registers an Athlete
   * POST /api/v1/athletes/register/by-admin
   */
  registerByClubAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await athleteService.register(req.body, req, {
      registeredById: req.user.userId,
    });

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
   * Get Logged-in Athlete Dashboard Profile
   * GET /api/v1/athletes/profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const athlete = await athleteService.getDashboardProfile(req.user.userId);

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
      req.params.status as AthleteStatus
    );

    return res.status(200).json({
      success: true,
      data: athletes,
    });
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const result = await athleteService.approve(
      req.params.id as string,
      req.user.userId
    );
    return res.status(200).json({ success: true, message: result.message, data: result.athlete });
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    const result = await athleteService.reject(
      req.params.id as string,
      req.user.userId,
      req.body.reason ?? "No reason provided."
    );
    return res.status(200).json({ success: true, message: result.message, data: result.athlete });
  });

  activate = asyncHandler(async (req: Request, res: Response) => {
    const result = await athleteService.activate(
      req.params.id as string,
      req.user.userId
    );
    return res.status(200).json({ success: true, message: result.message, data: result.athlete });
  });

  suspend = asyncHandler(async (req: Request, res: Response) => {
    const result = await athleteService.suspend(
      req.params.id as string,
      req.user.userId,
      req.body.reason
    );
    return res.status(200).json({ success: true, message: result.message, data: result.athlete });
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

  /**
   * Get Fayda demographic info for the logged-in athlete
   * GET /api/v1/athletes/profile/fayda
   */
  getFaydaForProfile = asyncHandler(async (req: Request, res: Response) => {
    const athlete = await athleteService.getByUserId(req.user.userId);

    const verification = await faydaService.getStatusForAthlete(athlete.id);

    return res.status(200).json({
      success: true,
      data: {
        verificationId: verification.id,
        status: verification.status,
        demographicData: verification.verifiedData ?? null,
      },
    });
  });

  // ─── Dashboard Handlers ──────────────────────────────────────────────────

  /**
   * PATCH /api/v1/athletes/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const result = await athleteService.updateProfile(req.user.userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  });

  /**
   * GET /api/v1/athletes/profile/personal-bests
   */
  getPersonalBests = asyncHandler(async (req: Request, res: Response) => {
    const data = await athleteService.getPersonalBests(req.user.userId);
    return res.status(200).json({ success: true, data });
  });

  /**
   * POST /api/v1/athletes/profile/personal-bests
   */
  createPersonalBest = asyncHandler(async (req: Request, res: Response) => {
    const data = await athleteService.createPersonalBest(req.user.userId, req.body);
    return res.status(201).json({ success: true, message: "Personal best added successfully", data });
  });

  /**
   * GET /api/v1/athletes/profile/training-logs
   */
  getTrainingLogs = asyncHandler(async (req: Request, res: Response) => {
    const data = await athleteService.getTrainingLogs(req.user.userId);
    return res.status(200).json({ success: true, data });
  });

  /**
   * POST /api/v1/athletes/profile/training-logs
   */
  createTrainingLog = asyncHandler(async (req: Request, res: Response) => {
    const data = await athleteService.createTrainingLog(req.user.userId, req.body);
    return res.status(201).json({ success: true, message: "Training session logged", data });
  });

  /**
   * GET /api/v1/athletes/profile/weight-logs
   */
  getWeightLogs = asyncHandler(async (req: Request, res: Response) => {
    const data = await athleteService.getWeightLogs(req.user.userId);
    return res.status(200).json({ success: true, data });
  });

  /**
   * POST /api/v1/athletes/profile/weight-logs
   */
  createWeightLog = asyncHandler(async (req: Request, res: Response) => {
    const data = await athleteService.createWeightLog(req.user.userId, req.body);
    return res.status(201).json({ success: true, message: "Weight entry logged", data });
  });

  /**
   * GET /api/v1/athletes/applications
   */
  getApplications = asyncHandler(async (req: Request, res: Response) => {
    const data = await athleteService.getApplications(req.user.userId);
    return res.status(200).json({ success: true, data });
  });

  // ─── Public Fan-Facing Handlers ──────────────────────────────────────────

  /**
   * GET /api/v1/athletes/public
   * Public endpoint for fan browsing — spotlight carousel + athlete directory.
   */
  getPublicList = asyncHandler(async (req: Request, res: Response) => {
    const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
    const status = (req.query.status as string) || "ACTIVE";
    const search = req.query.search as string | undefined;
    const club = req.query.club as string | undefined;
    const region = req.query.region as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    const result = await athleteService.getPublicAthletes({
      featured,
      status,
      search,
      club,
      region,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        limit,
        page,
      },
    });
  });

  /**
   * GET /api/v1/athletes/public/:id
   * Public endpoint for athlete detail modal / profile screen.
   */
  getPublicById = asyncHandler(async (req: Request, res: Response) => {
    const athlete = await athleteService.getPublicAthleteById(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: athlete,
    });
  });
}

export const athleteController = new AthleteController();