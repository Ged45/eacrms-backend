import prisma from "../../lib/prisma";
import { NotFoundError } from "../../errors/NotFoundError";
import { AuditActions } from "../../constants/audit-actions";
import { auditService } from "../audit/audit.service";
import { CreatePenaltyDTO } from "./athlete-penalty.validation";

interface Metadata { ipAddress?: string; userAgent?: string; }

export const athletePenaltyService = {
  async create(athleteId: string, data: CreatePenaltyDTO, issuedById: string, metadata?: Metadata) {
    const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
    if (!athlete) throw new NotFoundError("Athlete not found.", { code: "ATHLETE_NOT_FOUND", entity: "Athlete" });

    const penalty = await prisma.athletePenalty.create({
      data: {
        athleteId,
        type: data.type,
        reason: data.reason,
        severity: data.severity,
        issuedById,
      },
      include: {
        athlete: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
        issuedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await auditService.log({
      userId: issuedById,
      action: AuditActions.ISSUE_ATHLETE_PENALTY,
      entity: "AthletePenalty",
      entityId: penalty.id,
      details: { athleteId, type: data.type, severity: data.severity, reason: data.reason },
      ...metadata,
    });

    return penalty;
  },
};
