import { randomBytes } from "crypto";
import { EventAttendeeType, EventStatus } from "@prisma/client";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";
import prisma from "../../lib/prisma";
import { GenerateQrTokenDTO } from "./event-checkin.validation";
import { paymentService } from "../payments/payment.service";

interface Metadata { ipAddress?: string; userAgent?: string; }

const attendeeDetails = {
  event: { select: { id: true, title: true, status: true } },
  athlete: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
  club: { select: { id: true, name: true } },
};

export const eventCheckInService = {
  async generateToken(eventId: string, data: GenerateQrTokenDTO, generatedById: string, metadata?: Metadata) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError("Event not found.");
    if (event.status !== EventStatus.PUBLISHED) throw new BadRequestError("QR tokens can only be generated for published events.");

    if (data.attendeeType === EventAttendeeType.ATHLETE && !await prisma.athlete.findUnique({ where: { id: data.attendeeId } })) {
      throw new NotFoundError("Athlete not found.");
    }
    if (data.attendeeType === EventAttendeeType.ATHLETE && !await paymentService.canParticipate(eventId, data.attendeeId)) {
      throw new BadRequestError("Athlete must have a confirmed, paid event registration before check-in.");
    }
    if (data.attendeeType === EventAttendeeType.CLUB && !await prisma.club.findUnique({ where: { id: data.attendeeId } })) {
      throw new NotFoundError("Club not found.");
    }

    const attendee = data.attendeeType === EventAttendeeType.ATHLETE
      ? await prisma.eventAttendee.upsert({
          where: { eventId_athleteId: { eventId, athleteId: data.attendeeId } },
          update: {},
          create: { eventId, attendeeType: EventAttendeeType.ATHLETE, athleteId: data.attendeeId },
          include: { checkIn: true },
        })
      : await prisma.eventAttendee.upsert({
          where: { eventId_clubId: { eventId, clubId: data.attendeeId } },
          update: {},
          create: { eventId, attendeeType: EventAttendeeType.CLUB, clubId: data.attendeeId },
          include: { checkIn: true },
        });

    if (attendee.attendeeType !== data.attendeeType) throw new BadRequestError("Attendee already exists with a different type.");
    if (attendee.checkIn) throw new BadRequestError("Attendee has already checked in.");

    const expiresAt = new Date(Date.now() + data.expiresInMinutes * 60 * 1000);
    const token = randomBytes(32).toString("base64url");
    const qrToken = await prisma.eventQrToken.create({
      data: { token, attendeeId: attendee.id, expiresAt, generatedById },
      include: { attendee: { include: attendeeDetails } },
    });
    await auditService.log({ userId: generatedById, action: AuditActions.GENERATE_EVENT_QR_TOKEN, entity: "Event", entityId: eventId, details: { attendeeId: attendee.id, attendeeType: data.attendeeType, expiresAt }, ...metadata });
    return { ...qrToken, qrData: token };
  },

  async scan(eventId: string, token: string, checkedInById: string, metadata?: Metadata) {
    const now = new Date();
    const checkIn = await prisma.$transaction(async (tx) => {
      const qrToken = await tx.eventQrToken.findUnique({
        where: { token },
        include: { attendee: { include: attendeeDetails } },
      });
      if (!qrToken || qrToken.attendee.eventId !== eventId) throw new BadRequestError("Invalid QR code.");
      if (qrToken.expiresAt <= now) throw new BadRequestError("QR code has expired.");
      if (qrToken.usedAt) throw new BadRequestError("QR code has already been used.");

      const consumed = await tx.eventQrToken.updateMany({
        where: { id: qrToken.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) throw new BadRequestError("QR code is invalid, expired, or already used.");

      return tx.eventCheckIn.create({
        data: { attendeeId: qrToken.attendeeId, checkedInById },
        include: { attendee: { include: attendeeDetails }, checkedInBy: { select: { id: true, firstName: true, lastName: true } } },
      });
    });
    await auditService.log({ userId: checkedInById, action: AuditActions.VERIFY_EVENT_QR_CHECK_IN, entity: "Event", entityId: eventId, details: { attendeeId: checkIn.attendeeId, checkedInAt: checkIn.checkedInAt }, ...metadata });
    return checkIn;
  },

  async listCheckIns(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) throw new NotFoundError("Event not found.");
    return prisma.eventCheckIn.findMany({
      where: { attendee: { eventId } },
      orderBy: { checkedInAt: "desc" },
      include: { attendee: { include: attendeeDetails }, checkedInBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  },
};
