import { Request, Response, NextFunction } from "express";
import { policiesService } from "./policies.service";
import { PolicyStatus, PolicyScope } from "@prisma/client";

export const policiesController = {
  /**
   * Create a new policy
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const policy = await policiesService.create(req.body, userId);
      return res.status(201).json({
        success: true,
        message: "Policy created successfully.",
        data: policy,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all policies (with optional filter queries)
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, scope } = req.query as { status?: PolicyStatus; scope?: PolicyScope };
      const policies = await policiesService.getAll({ status, scope });
      return res.status(200).json({
        success: true,
        data: policies,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get policy by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const policy = await policiesService.getById(id);
      return res.status(200).json({
        success: true,
        data: policy,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update policy
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const policy = await policiesService.update(id, req.body, userId);
      return res.status(200).json({
        success: true,
        message: "Policy updated successfully.",
        data: policy,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Submit policy for approval
   */
  async submitForApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const policy = await policiesService.submitForApproval(id, userId);
      return res.status(200).json({
        success: true,
        message: "Policy submitted for approval.",
        data: policy,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Approve policy
   */
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const policy = await policiesService.approve(id, userId);
      return res.status(200).json({
        success: true,
        message: "Policy approved successfully.",
        data: policy,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Archive policy
   */
  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const policy = await policiesService.archive(id, userId);
      return res.status(200).json({
        success: true,
        message: "Policy archived successfully.",
        data: policy,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete policy
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const result = await policiesService.delete(id, userId);
      return res.status(200).json({
        message: "Policy soft-deleted successfully.",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};
