import { NextFunction, Request, Response } from "express";

import { authService } from "./auth.service";
import {
  LoginSchema,
  RegisterSchema,
} from "./auth.validation";

export const authController = {
  /**
   * ----------------------------------------
   * Register
   * ----------------------------------------
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validation =
        RegisterSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors:
            validation.error.flatten().fieldErrors,
        });
      }

      const user =
        await authService.register(
          validation.data
        );

      return res.status(201).json({
        success: true,
        message:
          "User registered successfully.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ----------------------------------------
   * Login
   * ----------------------------------------
   */
  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validation =
        LoginSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors:
            validation.error.flatten().fieldErrors,
        });
      }

      const result =
        await authService.login(
          validation.data
        );

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ----------------------------------------
   * Current User
   * ----------------------------------------
   */
  async me(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Will be populated by auth middleware later
      const userId = req.user.userId;

      const user =
        await authService.me(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ----------------------------------------
   * Refresh Token
   * ----------------------------------------
   */
  async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      return res.status(501).json({
        success: false,
        message:
          "Refresh token endpoint not implemented yet.",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ----------------------------------------
   * Logout
   * ----------------------------------------
   */
  async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};