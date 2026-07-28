import { Request, Response } from "express";

import { clubService } from "./club.service";

import { asyncHandler } from "../../middleware/asyncHandler";

export const clubController = {
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
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const clubs = await clubService.findAll();

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
  findVerified: asyncHandler(async (_req: Request, res: Response) => {
    const clubs = await clubService.findVerified();

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  }),

  /**
   * --------------------------------------------------------
   * Get Club By ID
   * GET /api/v1/clubs/:id
   * --------------------------------------------------------
   */
  findById: asyncHandler(async (req: Request, res: Response) => {
    const club = await clubService.findById(req.params.id as string);

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