import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";
import { AuditActions } from "../../constants/audit-actions";
import { auditService } from "../audit/audit.service";
import { competitionResultRepository } from "./competition-result.repository";
import { CreateCompetitionResultDTO } from "./competition-result.validation";
import prisma from "../../lib/prisma";

interface Metadata { ipAddress?: string; userAgent?: string; }

export const competitionResultService = {
  async create(eventId: string, data: CreateCompetitionResultDTO, userId: string, metadata?: Metadata) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError("Event not found.", { code: "EVENT_NOT_FOUND", entity: "Event" });

    const result = await competitionResultRepository.create({
      eventId,
      categoryId: data.categoryId,
      discipline: data.discipline,
      createdById: userId,
      entries: data.entries,
    });

    await auditService.log({
      userId,
      action: AuditActions.CREATE_COMPETITION_RESULTS,
      entity: "CompetitionResult",
      entityId: result?.id ?? "",
      details: { eventId, categoryId: data.categoryId, discipline: data.discipline, entryCount: data.entries.length },
      ...metadata,
    });

    return result;
  },

  async publish(eventId: string, userId: string, metadata?: Metadata) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError("Event not found.", { code: "EVENT_NOT_FOUND", entity: "Event" });

    const result = await competitionResultRepository.publishByEventId(eventId);
    if (result.published === 0) {
      throw new BadRequestError("No unpublished results found for this event.", { code: "NO_UNPUBLISHED_RESULTS", entity: "CompetitionResult" });
    }

    await auditService.log({
      userId,
      action: AuditActions.PUBLISH_COMPETITION_RESULTS,
      entity: "CompetitionResult",
      entityId: eventId,
      details: { eventId, publishedCount: result.published },
      ...metadata,
    });

    return result;
  },
};
