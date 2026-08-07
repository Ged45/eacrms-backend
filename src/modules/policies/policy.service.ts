import { PolicyScope, Prisma } from "@prisma/client";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";
import prisma from "../../lib/prisma";
import { policyRepository } from "./policy.repository";
import { AssignPolicyDTO, CreatePolicyDTO, UpdatePolicyDTO } from "./policy.validation";

interface Metadata { ipAddress?: string; userAgent?: string; }

export const policyService = {
  async create(data: CreatePolicyDTO, userId: string, metadata?: Metadata) {
    const policy = await policyRepository.create({
      ...data,
      rules: data.rules as Prisma.InputJsonValue,
      createdBy: { connect: { id: userId } },
      updatedBy: { connect: { id: userId } },
      auditLogs: { create: { action: "CREATED", changedBy: { connect: { id: userId } }, newValue: data.rules as Prisma.InputJsonValue } },
    });
    await auditService.log({ userId, action: AuditActions.CREATE_POLICY, entity: "Policy", entityId: policy.id, details: { code: policy.code, scope: policy.scope }, ...metadata });
    return policy;
  },

  findAll() { return policyRepository.findAll(); },
  findRelevant(userId: string) { return policyRepository.findRelevant(userId); },

  async findById(id: string) {
    const policy = await policyRepository.findById(id);
    if (!policy) throw new NotFoundError("Policy not found.");
    return policy;
  },

  async update(id: string, data: UpdatePolicyDTO, userId: string, metadata?: Metadata) {
    const policy = await this.findById(id);
    const { rules, ...policyData } = data;
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.policy.update({
        where: { id },
        data: { ...policyData, ...(rules && { rules: rules as Prisma.InputJsonValue }), updatedById: userId },
        include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true } }, updatedBy: { select: { id: true, firstName: true, lastName: true, email: true } }, assignments: true },
      });
      await tx.policyAuditLog.create({
        data: { policyId: id, action: "UPDATED", changedById: userId, oldValue: policy.rules as Prisma.InputJsonValue, newValue: (rules ?? policy.rules) as Prisma.InputJsonValue },
      });
      return result;
    });
    await auditService.log({ userId, action: AuditActions.UPDATE_POLICY, entity: "Policy", entityId: id, details: { changedFields: Object.keys(data) }, ...metadata });
    return updated;
  },

  async assign(id: string, data: AssignPolicyDTO, userId: string, metadata?: Metadata) {
    const policy = await this.findById(id);
    if (policy.scope === PolicyScope.CLUB && !data.clubId) throw new BadRequestError("A CLUB policy must be assigned to a club.");
    if (policy.scope === PolicyScope.EVENT && !data.eventId) throw new BadRequestError("An EVENT policy must be assigned to an event.");
    if (policy.scope === PolicyScope.ATHLETE_PARTICIPATION && !data.clubId) throw new BadRequestError("An ATHLETE_PARTICIPATION policy must be assigned to a club.");
    if (data.clubId && !await prisma.club.findUnique({ where: { id: data.clubId } })) throw new NotFoundError("Club not found.");
    if (data.eventId && !await prisma.event.findUnique({ where: { id: data.eventId } })) throw new NotFoundError("Event not found.");
    const assignment = await policyRepository.createAssignment(id, data.clubId, data.eventId, userId);
    await auditService.log({ userId, action: AuditActions.ASSIGN_POLICY, entity: "Policy", entityId: id, details: { assignmentId: assignment.id, ...data }, ...metadata });
    return assignment;
  },

  async unassign(id: string, assignmentId: string, userId: string, metadata?: Metadata) {
    await this.findById(id);
    const assignment = await policyRepository.deleteAssignment(id, assignmentId, userId);
    if (!assignment) throw new NotFoundError("Policy assignment not found.");
    await auditService.log({ userId, action: AuditActions.UNASSIGN_POLICY, entity: "Policy", entityId: id, details: { assignmentId }, ...metadata });
  },

  async auditLog(id: string) {
    await this.findById(id);
    return policyRepository.findAuditLog(id);
  },

  findApplicable(scope: PolicyScope, target: { clubId?: string; eventId?: string }) {
    return policyRepository.findApplicable(scope, target);
  },
};
