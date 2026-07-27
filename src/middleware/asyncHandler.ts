import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps async route handlers and forwards
 * errors to Express error middleware.
 */
export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };