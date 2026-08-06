import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { userService } from "./user.service";

export const userController = {
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.findAll();
    return res.status(200).json({ success: true, data: users });
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.activate(req.params.id as string, req.user.userId);
    return res.status(200).json({ success: true, message: result.message, data: result.user });
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.deactivate(req.params.id as string, req.user.userId);
    return res.status(200).json({ success: true, message: result.message, data: result.user });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.delete(req.params.id as string, req.user.userId);
    return res.status(200).json({ success: true, message: result.message });
  }),
};
