import { randomBytes, timingSafeEqual } from "crypto";
import type { EventRegistrationStatus, PaymentStatus } from "@prisma/client";
import { EventStatus, PaymentType, Prisma } from "@prisma/client";
import { BadRequestError } from "../../errors/BadRequestError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { NotFoundError } from "../../errors/NotFoundError";
import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";
import { authorizationService } from "../authorizations/authorization.service";
import prisma from "../../lib/prisma";
import { CreateEventRegistrationDTO } from "./payment.validation";

interface Metadata { ipAddress?: string; userAgent?: string; }

const paymentDetails = {
  event: { select: { id: true, title: true } },
  athlete: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
  registration: true,
  history: { orderBy: { createdAt: "asc" as const } },
};

function createReference() {
  return `EACRMS-${Date.now()}-${randomBytes(5).toString("hex").toUpperCase()}`;
}

export const paymentService = {
  async createEventRegistration(eventId: string, data: CreateEventRegistrationDTO, userId: string, metadata?: Metadata) {
    const [event, athlete] = await Promise.all([
      prisma.event.findUnique({ where: { id: eventId } }),
      prisma.athlete.findUnique({ where: { id: data.athleteId } }),
    ]);
    if (!event) throw new NotFoundError("Event not found.");
    if (event.status !== EventStatus.PUBLISHED) throw new BadRequestError("Registration is only available for published events.");
    if (!athlete) throw new NotFoundError("Athlete not found.");
    if (athlete.userId !== userId && !await authorizationService.hasPermission(userId, "payment:create")) {
      throw new ForbiddenError("You can only register your own athlete profile.");
    }

    const reference = createReference();
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.eventRegistration.findUnique({ where: { eventId_athleteId: { eventId, athleteId: athlete.id } } });
      if (existing) throw new BadRequestError("This athlete is already registered for the event.");
      const registration = await tx.eventRegistration.create({
        data: { eventId, athleteId: athlete.id, createdById: userId },
      });
      const payment = await tx.payment.create({
        data: {
          reference,
          type: PaymentType.EVENT_REGISTRATION,
          amount: new Prisma.Decimal(data.amount),
          currency: data.currency.toUpperCase(),
          userId,
          eventId,
          athleteId: athlete.id,
          registrationId: registration.id,
          history: { create: { newStatus: 'PENDING' } },
        },
        include: paymentDetails,
      });
      return { registration, payment };
    });
    await auditService.log({ userId, action: AuditActions.CREATE_PAYMENT, entity: "Payment", entityId: result.payment.id, details: { reference, eventId, athleteId: athlete.id, amount: data.amount, currency: data.currency }, ...metadata });
    return {
      ...result,
      mockCheckout: {
        reference,
        callbackEndpoint: "/api/v1/payments/mock/webhook",
        instructions: "Send a signed mock webhook with this reference, status PAID or FAILED, and a transactionId.",
      },
    };
  },

  async findStatus(paymentId: string, userId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: paymentDetails });
    if (!payment) throw new NotFoundError("Payment not found.");
    if (payment.userId !== userId && !await authorizationService.hasPermission(userId, "payment:view")) {
      throw new ForbiddenError("You cannot view this payment.");
    }
    return payment;
  },

  async historyForUser(userId: string) {
    return prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: paymentDetails });
  },

  verifyWebhookSecret(received: string | undefined) {
    const configured = process.env.MOCK_PAYMENT_WEBHOOK_SECRET;
    const expected = configured ?? (process.env.NODE_ENV === "production" ? "" : "mock-dev-secret");
    if (!expected || !received) throw new ForbiddenError("Invalid payment webhook signature.");
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
      throw new ForbiddenError("Invalid payment webhook signature.");
    }
  },

  async processMockWebhook(reference: string, status: PaymentStatus, transactionId: string, payload: unknown, metadata?: Metadata) {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { reference }, include: paymentDetails });
      if (!payment) throw new NotFoundError("Payment not found.");

          if (payment.status !== 'PENDING') {
            if (payment.status === status && payment.externalTransactionId === transactionId) return payment;
            throw new BadRequestError("Payment has already reached a final status.");
          }

      const now = new Date();
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          externalTransactionId: transactionId,
          providerPayload: payload as Prisma.InputJsonValue,
          ...(status === 'PAID' && { paidAt: now }),
          ...(status === 'PAID' && payment.registrationId && { registration: { update: { status: 'CONFIRMED' } } }),
        },
        include: paymentDetails,
      });
      await tx.paymentStatusHistory.create({
        data: { paymentId: payment.id, previousStatus: 'PENDING', newStatus: status, transactionId, payload: payload as Prisma.InputJsonValue },
      });
      return updated;
    });
    await auditService.log({ userId: result.userId, action: AuditActions.PAYMENT_WEBHOOK_RECEIVED, entity: "Payment", entityId: result.id, details: { reference, status, transactionId }, ...metadata });
    if (status === 'PAID') {
      await auditService.log({ userId: result.userId, action: AuditActions.VERIFY_PAYMENT, entity: "Payment", entityId: result.id, details: { reference, status, transactionId }, ...metadata });
    }
    return result;
  },

  async canParticipate(eventId: string, athleteId: string) {
    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_athleteId: { eventId, athleteId } },
      include: { payment: { select: { status: true } } },
    });
    return Boolean(registration?.status === 'CONFIRMED' && registration.payment?.status === 'PAID');
  },
};
