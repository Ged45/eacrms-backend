import { Request, Response } from "express";

import { clubService } from "./club.service";

import { asyncHandler } from "../../middleware/asyncHandler";

export const clubController = {
  /**
   * --------------------------------------------------------
   * Register Club Admin (User + Club)
   * POST /api/v1/clubs/register-admin
   * --------------------------------------------------------
   */
  registerAdmin: asyncHandler(async (req: Request, res: Response) => {
    const result = await clubService.registerAdmin(req.body, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || undefined,
    });

    res.status(201).json({
      success: true,
      message: "Club admin registered successfully. Please verify your account.",
      data: result,
    });
  }),
  /**
   * --------------------------------------------------------
   * Register Club
   * POST /api/v1/clubs/register
   * --------------------------------------------------------
   */
  register: asyncHandler(async (req: Request, res: Response) => {
    const club = await clubService.register(req.body, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || undefined,
    });

    res.status(201).json({
      success: true,
      message: "Club registration submitted successfully.",
      data: club,
    });
  }),

  /**
   * --------------------------------------------------------
   * Get All Clubs
   * GET /api/v1/clubs
   * --------------------------------------------------------
   */
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const clubs = await clubService.findAll(req.user.userId);

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  }),

  /**
   * --------------------------------------------------------
   * Get Pending Clubs
   * GET /api/v1/clubs/pending
   * --------------------------------------------------------
   */
  findPending: asyncHandler(async (_req: Request, res: Response) => {
    const clubs = await clubService.findPending();

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  }),

  /**
   * --------------------------------------------------------
   * Get Verified Clubs
   * GET /api/v1/clubs/verified
   * --------------------------------------------------------
   */
  findVerified: asyncHandler(async (req: Request, res: Response) => {
    const raw = await clubService.findVerifiedCached({
      search: req.query.search as string | undefined,
      region: req.query.region as string | undefined,
      city: req.query.city as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });

    // Transform: convert _count to flat fields
    const clubs = (raw as any[]).map((c) => ({
      ...c,
      athleteCount: c._count?.athletes ?? 0,
      coachCount: c._count?.coaches ?? 0,
      _count: undefined,
    }));

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  }),

  /**
   * --------------------------------------------------------
   * Get Club By ID (Admin — with full data)
   * GET /api/v1/clubs/:id
   * --------------------------------------------------------
   */
  findById: asyncHandler(async (req: Request, res: Response) => {
    const club = await clubService.findById(req.params.id as string, req.user.userId);

    res.status(200).json({
      success: true,
      data: club,
    });
  }),

  /**
   * --------------------------------------------------------
   * Get Club By ID (Public — cached)
   * GET /api/v1/clubs/public/:id
   * --------------------------------------------------------
   */
  findPublicById: asyncHandler(async (req: Request, res: Response) => {
    const club = await clubService.findByIdCached(req.params.id as string);

    res.status(200).json({
      success: true,
      data: club,
    });
  }),

  /**
   * --------------------------------------------------------
   * Approve Club
   * PATCH /api/v1/clubs/:id/approve
   * --------------------------------------------------------
   */
  approve: asyncHandler(async (req: Request, res: Response) => {
    const club = await clubService.approve(
      req.params.id as string,
      {
        approvedBy: req.user.userId,
      },
      {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined,
      }
    );

    res.status(200).json({
      success: true,
      message: "Club approved successfully.",
      data: club,
    });
  }),

  /**
   * --------------------------------------------------------
   * Reject Club
   * PATCH /api/v1/clubs/:id/reject
   * --------------------------------------------------------
   */
  reject: asyncHandler(async (req: Request, res: Response) => {
    const club = await clubService.reject(
      req.params.id as string,
      {
        reason: req.body.reason,
        rejectedBy: req.user.userId,
      },
      {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined,
      }
    );

    res.status(200).json({
      success: true,
      message: "Club rejected successfully.",
      data: club,
    });
  }),

  /**
   * --------------------------------------------------------
   * Suspend Club
   * PATCH /api/v1/clubs/:id/suspend
   * --------------------------------------------------------
   */
  suspend: asyncHandler(async (req: Request, res: Response) => {
    const club = await clubService.suspend(
      req.params.id as string,
      req.user.userId,
      {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || undefined,
      }
    );

    res.status(200).json({
      success: true,
      message: "Club suspended successfully.",
      data: club,
    });
  }),

  /**
   * --------------------------------------------------------
   * Delete Club
   * DELETE /api/v1/clubs/:id
   * --------------------------------------------------------
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    await clubService.delete(req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Club deleted successfully.",
    });
  }),
};