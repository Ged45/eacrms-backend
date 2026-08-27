import { policiesRepository } from "./policies.repository";
import { auditService } from "../audit/audit.service";
import { PolicyStatus, PolicyType } from "@prisma/client";

export const policiesService = {
  /**
   * Create a new policy
   */
  async create(data: any, userId: string) {
    const policy = await policiesRepository.create({
      name: data.title || data.name || data.code,
      description: data.description,
      type: data.type || PolicyType.RULE,
      content: data.content || (data.rules ? JSON.stringify(data.rules) : "{}"),
      scope: data.scope,
      status: data.status || PolicyStatus.DRAFT,
      createdBy: { connect: { id: userId } },
    });

    // Log audit
    await auditService.log({
      userId,
      action: "CREATE",
      entity: "POLICY",
      entityId: policy.id,
      details: {
        name: policy.name,
        type: policy.type,
        scope: policy.scope,
      },
    });

    return policy;
  },

  /**
   * Get all policies with filters
   */
  async getAll(filters?: any) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.scope) {
      where.scope = filters.scope;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return policiesRepository.findMany(where);
  },

  /**
   * Get policy by ID
   */
  async getById(id: string) {
    const policy = await policiesRepository.findById(id);

    if (!policy) {
      throw new Error("Policy not found.");
    }

    return policy;
  },

  /**
   * Update a policy
   */
  async update(id: string, data: any, userId: string) {
    const policy = await this.getById(id);

    if (
      policy.status !== PolicyStatus.DRAFT &&
      policy.status !== PolicyStatus.PENDING_APPROVAL
    ) {
      throw new Error(
        "Can only update policies in DRAFT or PENDING_APPROVAL status."
      );
    }

    const updatePayload: any = {
      ...data,
      updatedBy: { connect: { id: userId } },
    };

    if (data.title) updatePayload.name = data.title;
    if (data.rules) updatePayload.content = JSON.stringify(data.rules);

    delete updatePayload.title;
    delete updatePayload.code;
    delete updatePayload.rules;

    const updated = await policiesRepository.update(id, updatePayload);

    await auditService.log({
      userId,
      action: "UPDATE",
      entity: "POLICY",
      entityId: id,
      details: {
        changes: data,
      },
    });

    return updated;
  },

  /**
   * Submit policy for approval (DRAFT -> PENDING_APPROVAL)
   */
  async submitForApproval(id: string, userId: string) {
    const policy = await this.getById(id);

    if (policy.status !== PolicyStatus.DRAFT) {
      throw new Error("Only DRAFT policies can be submitted for approval.");
    }

    const updated = await policiesRepository.update(id, {
      status: PolicyStatus.PENDING_APPROVAL,
      updatedBy: { connect: { id: userId } },
    });

    await auditService.log({
      userId,
      action: "SUBMIT_FOR_APPROVAL",
      entity: "POLICY",
      entityId: id,
      details: {
        previousStatus: policy.status,
        newStatus: PolicyStatus.PENDING_APPROVAL,
      },
    });

    return updated;
  },

  /**
   * Approve a policy (PENDING_APPROVAL -> ACTIVE)
   */
  async approve(id: string, approvedById: string) {
    const policy = await this.getById(id);

    if (policy.status !== PolicyStatus.PENDING_APPROVAL) {
      throw new Error("Only PENDING_APPROVAL policies can be approved.");
    }

    const updated = await policiesRepository.approve(id, approvedById);

    await auditService.log({
      userId: approvedById,
      action: "APPROVE",
      entity: "POLICY",
      entityId: id,
      details: {
        newStatus: PolicyStatus.ACTIVE,
      },
    });

    return updated;
  },

  /**
   * Archive a policy
   */
  async archive(id: string, userId: string) {
    const policy = await this.getById(id);

    if (policy.status === PolicyStatus.ARCHIVED) {
      throw new Error("Policy is already archived.");
    }

    const updated = await policiesRepository.archive(id);

    await auditService.log({
      userId,
      action: "ARCHIVE",
      entity: "POLICY",
      entityId: id,
      details: {
        previousStatus: policy.status,
      },
    });

    return updated;
  },

  /**
   * Delete a policy (soft delete)
   */
  async delete(id: string, userId: string) {
    await this.getById(id);

    await policiesRepository.softDelete(id);

    await auditService.log({
      userId,
      action: "DELETE",
      entity: "POLICY",
      entityId: id,
    });

    return { success: true };
  },
};
