import { EventStatus, Prisma } from "@prisma/client";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";
import { eventRepository } from "./event.repository";
import { CreateEventDTO } from "./event.validation";

interface Metadata { ipAddress?: string; userAgent?: string; }

const validTransitions: Record<EventStatus, EventStatus[]> = {
  DRAFT: [EventStatus.PENDING_APPROVAL, EventStatus.CANCELLED],
  PENDING_APPROVAL: [EventStatus.PUBLISHED, EventStatus.REJECTED, EventStatus.CANCELLED],
  PUBLISHED: [EventStatus.CANCELLED],
  REJECTED: [EventStatus.DRAFT, EventStatus.CANCELLED],
  CANCELLED: [],
};

export const eventService = {
  async create(data: CreateEventDTO, userId: string, metadata?: Metadata) {
    const event = await eventRepository.create({
      ...data,
      schedule: data.schedule as Prisma.InputJsonValue,
      createdBy: { connect: { id: userId } },
      statusHistory: { create: { newStatus: EventStatus.DRAFT, changedBy: { connect: { id: userId } } } },
    });
    await auditService.log({ userId, action: AuditActions.CREATE_EVENT, entity: "Event", entityId: event.id, details: { status: event.status, category: event.category }, ...metadata });
    return event;
  },

  findAll() { return eventRepository.findAll(); },
  findPublished() { return eventRepository.findPublished(); },

  async findById(id: string) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError("Event not found.");
    return event;
  },

  async submit(id: string, userId: string, metadata?: Metadata) {
    const event = await this.findById(id);
    if (event.createdById !== userId) {
      throw new ForbiddenError("Only the event creator can submit this event for approval.");
    }
    return this.changeStatus(id, EventStatus.DRAFT, EventStatus.PENDING_APPROVAL, userId, undefined, AuditActions.SUBMIT_EVENT_FOR_APPROVAL, metadata);
  },

  async approve(id: string, userId: string, metadata?: Metadata) {
    return this.changeStatus(id, EventStatus.PENDING_APPROVAL, EventStatus.PUBLISHED, userId, undefined, AuditActions.APPROVE_EVENT, metadata);
  },

  async reject(id: string, userId: string, reason: string, metadata?: Metadata) {
    return this.changeStatus(id, EventStatus.PENDING_APPROVAL, EventStatus.REJECTED, userId, reason, AuditActions.REJECT_EVENT, metadata);
  },

  async overrideStatus(id: string, userId: string, status: EventStatus, reason: string, metadata?: Metadata) {
    const event = await this.findById(id);
    if (event.status === status) throw new BadRequestError("Event already has this status.");
    return this.changeStatus(id, event.status, status, userId, reason, AuditActions.OVERRIDE_EVENT_STATUS, metadata, true);
  },

  async changeStatus(id: string, from: EventStatus, to: EventStatus, userId: string, reason: string | undefined, action: string, metadata?: Metadata, isOverride = false) {
    const event = await this.findById(id);
    if (event.status !== from) throw new BadRequestError(`Event must be ${from} before it can be changed to ${to}.`);
    if (!isOverride && !validTransitions[from].includes(to)) throw new BadRequestError(`Invalid event status transition from ${from} to ${to}.`);

    const updated = await eventRepository.transition(id, from, to, userId, reason);
    if (!updated) throw new BadRequestError("The event status changed. Refresh and try again.");

    await auditService.log({ userId, action, entity: "Event", entityId: id, details: { previousStatus: from, newStatus: to, reason }, ...metadata });
    return updated;
  },
};
