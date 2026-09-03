import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { resultService } from "./result.service";

export const resultController = {
  /** Endpoint 1.1: Active Live Events List */
  getLiveEvents: asyncHandler(async (_req: Request, res: Response) => {
    const data = await resultService.getLiveEvents();
    res.json({ data });
  }),

  /** Endpoint 1.2: Single Live Event Details Container */
  getLiveEventById: asyncHandler(async (req: Request, res: Response) => {
    const data = await resultService.getLiveEventById(req.params.eventId as string);
    res.json(data);
  }),

  /** Endpoint 1.3: Isolated Live Competition Leaderboard */
  getLiveCompetition: asyncHandler(async (req: Request, res: Response) => {
    const data = await resultService.getLiveCompetition(
      req.params.eventId as string,
      req.params.compId as string
    );
    res.json(data);
  }),

  /** Endpoint 1.4: Direct single-race live scoreboard (deep link) */
  getLiveScoreboard: asyncHandler(async (req: Request, res: Response) => {
    const data = await resultService.getLiveScoreboard(req.params.eventId as string);
    res.json(data);
  }),

  /** Endpoint 2.1: Published Completed Results List */
  getPublishedResults: asyncHandler(async (req: Request, res: Response) => {
    const { category, search, gender, page, limit } = req.query;
    const data = await resultService.getPublishedResults({
      category: category as string,
      search: search as string,
      gender: gender as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(data);
  }),

  /** Endpoint 2.2: Single Completed Result Details */
  getResultById: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const data = await resultService.getResultById(req.params.id as string, userId);
    res.json(data);
  }),

  /** Endpoint 3.1: Athlete Personal Results */
  getMyResults: asyncHandler(async (req: Request, res: Response) => {
    const data = await resultService.getMyResults(req.user.userId);
    res.json(data);
  }),

  /** Endpoint 3.2: Club Admin Results */
  getMyClubResults: asyncHandler(async (req: Request, res: Response) => {
    const data = await resultService.getMyClubResults(req.user.userId);
    res.json(data);
  }),

  /** Endpoint 3.3: Notable Results (podium finishes + records) */
  getNotableResults: asyncHandler(async (_req: Request, res: Response) => {
    const data = await resultService.getNotableResults();
    res.json(data);
  }),
};
