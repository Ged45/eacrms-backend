import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";
import { AuditActions } from "../../constants/audit-actions";
import { auditService } from "../audit/audit.service";
import { applicationRepository } from "./application.repository";
import { ApplicationQueryDTO, ReviewApplicationDTO } from "./application.validation";

interface Metadata { ipAddress?: string; userAgent?: string; }

export const applicationService = {
  findAll(query: ApplicationQueryDTO) {
    return applicationRepository.findAll(query);
  },

  async review(id: string, data: ReviewApplicationDTO, userId: string, metadata?: Metadata) {
    const application = await applicationRepository.findById(id);
    if (!application) throw new NotFoundError("Application not found.", { code: "APPLICATION_NOT_FOUND", entity: "Application" });

    if (application.status !== "PENDING") {
      throw new BadRequestError("Application has already been reviewed.", { code: "APPLICATION_ALREADY_REVIEWED", entity: "Application", field: "status" });
    }

    const updated = await applicationRepository.update(id, {
      status: data.status,
      reviewNote: data.reviewNote,
      reviewedBy: { connect: { id: userId } },
      reviewedAt: new Date(),
    });

    await auditService.log({
      userId,
      action: AuditActions.REVIEW_APPLICATION,
      entity: "Application",
      entityId: id,
      details: { type: application.type, entityId: application.entityId, status: data.status, reviewNote: data.reviewNote },
      ...metadata,
    });

    return updated;
  },
};
