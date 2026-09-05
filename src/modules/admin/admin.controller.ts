import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { adminService } from "./admin.service";

export const adminController = {
  createUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.createUser(
      req.body,
      req.user.userId,
      { ipAddress: req.ip, userAgent: req.get("user-agent") || undefined }
    );
    res.status(201).json({ success: true, message: "User created successfully.", data: user });
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUser(
      req.params.id as string,
      req.body,
      req.user.userId,
      { ipAddress: req.ip, userAgent: req.get("user-agent") || undefined }
    );
    res.json({ success: true, message: "User updated successfully.", data: user });
  }),
};
