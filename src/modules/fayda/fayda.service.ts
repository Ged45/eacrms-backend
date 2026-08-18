import { faydaRepository } from "./fayda.repository";
import { faydaMockGateway } from "./fayda.mock";
import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";
import { athleteRepository } from "../athletes/athlete.repository";
import { coachRepository } from "../coaches/coach.repository";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import prisma from "../../lib/prisma";
import { issueFaydaVerificationToken } from "../../utils/auth-contract";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export const faydaService = {
  /**
   * Step 1 — Athlete submits their NIN.
   * System generates an OTP and "sends" it via the mock gateway.
   */
  async initiateForAthlete(
    athleteId: string,
    nin: string,
    requesterId: string
  ) {
    const athlete = await athleteRepository.findById(athleteId);
    if (!athlete) throw new NotFoundError("Athlete not found.");

    if (athlete.faydaVerified) {
      throw new ConflictError("Athlete is already Fayda verified.");
    }

    // Check for an active (non-expired) pending verification
    const existing = await faydaRepository.findLatestByAthlete(athleteId);
    if (
      existing &&
      existing.status === "OTP_SENT" &&
      existing.otpExpiresAt > new Date()
    ) {
      throw new ConflictError(
        "A verification is already in progress. Please check your OTP."
      );
    }

    const otp = await faydaMockGateway.sendOtp(nin);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const verification = await faydaRepository.createVerification({
      nin,
      otp,
      otpExpiresAt,
      athleteId,
    });

    // Mark status OTP_SENT
    await faydaRepository.updateStatus(verification.id, "OTP_SENT");

    await auditService.log({
      userId: requesterId,
      action: AuditActions.FAYDA_VERIFY_INITIATED,
      entity: "Athlete",
      entityId: athleteId,
      details: { nin },
    });

    return {
      verificationId: verification.id,
      message: `OTP sent to the phone number registered with NIN ${nin}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      // Expose OTP in dev only — remove in production
      ...(process.env.NODE_ENV !== "production" && { otp }),
    };
  },

  /**
   * Step 1 — Coach submits their NIN.
   */
  async initiateForCoach(
    coachId: string,
    nin: string,
    requesterId: string
  ) {
    const coach = await coachRepository.findById(coachId);
    if (!coach) throw new NotFoundError("Coach not found.");

    if (coach.faydaVerified) {
      throw new ConflictError("Coach is already Fayda verified.");
    }

    const existing = await faydaRepository.findLatestByCoach(coachId);
    if (
      existing &&
      existing.status === "OTP_SENT" &&
      existing.otpExpiresAt > new Date()
    ) {
      throw new ConflictError(
        "A verification is already in progress. Please check your OTP."
      );
    }

    const otp = await faydaMockGateway.sendOtp(nin);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const verification = await faydaRepository.createVerification({
      nin,
      otp,
      otpExpiresAt,
      coachId,
    });

    await faydaRepository.updateStatus(verification.id, "OTP_SENT");

    await auditService.log({
      userId: requesterId,
      action: AuditActions.FAYDA_VERIFY_INITIATED,
      entity: "Coach",
      entityId: coachId,
      details: { nin },
    });

    return {
      verificationId: verification.id,
      message: `OTP sent to the phone number registered with NIN ${nin}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      ...(process.env.NODE_ENV !== "production" && { otp }),
    };
  },

  /**
   * Step 2 — Athlete / Coach submits the OTP.
   * System validates it, fetches demographic data, cross-checks,
   * and advances status to FAYDA_VERIFIED.
   */
  async initiateStateless(nin: string, requesterId: string) {
    const otp = await faydaMockGateway.sendOtp(nin);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const verification = await faydaRepository.createVerification({
      nin,
      otp,
      otpExpiresAt,
    });

    await faydaRepository.updateStatus(verification.id, "OTP_SENT");

    await auditService.log({
      userId: requesterId,
      action: AuditActions.FAYDA_VERIFY_INITIATED,
      entity: "FaydaVerification",
      entityId: verification.id,
      details: { nin },
    });

    return {
      verificationId: verification.id,
      message: `OTP sent to the phone number registered with NIN ${nin}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      ...(process.env.NODE_ENV !== "production" && { otp }),
    };
  },

  async confirmStatelessOtp(verificationId: string | undefined, otp: string | undefined, requesterId: string) {
    if (!verificationId) {
      throw new BadRequestError("Verification ID is required.");
    }

    if (!otp) {
      throw new BadRequestError("OTP is required.");
    }

    const verification = await faydaRepository.findById(verificationId);
    if (!verification) throw new NotFoundError("Verification record not found.");

    if (verification.status === "CONFIRMED") {
      throw new ConflictError("This verification has already been confirmed.");
    }

    if (verification.status === "FAILED" || verification.status === "EXPIRED") {
      throw new BadRequestError("This verification has expired or failed. Please initiate a new one.");
    }

    if (verification.otpExpiresAt < new Date()) {
      await faydaRepository.updateStatus(verification.id, "EXPIRED");
      throw new BadRequestError("OTP has expired. Please initiate a new verification.");
    }

    if (verification.attempts >= MAX_ATTEMPTS) {
      await faydaRepository.updateStatus(verification.id, "FAILED");
      throw new BadRequestError("Maximum OTP attempts exceeded.");
    }

    if (verification.otp !== otp) {
      await faydaRepository.incrementAttempts(verification.id, verification.attempts + 1);
      const remaining = MAX_ATTEMPTS - verification.attempts - 1;
      throw new BadRequestError(`Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
    }

    const demographicData = await faydaMockGateway.verifyOtpAndGetData(verification.nin);
    const verificationToken = issueFaydaVerificationToken({
      nin: verification.nin,
      firstName: demographicData.firstName,
      lastName: demographicData.lastName,
      dateOfBirth: demographicData.dateOfBirth,
      gender: demographicData.gender,
      phoneNumber: demographicData.phoneNumber,
      fanNumber: demographicData.nin,
    });

    await faydaRepository.updateStatus(verification.id, "CONFIRMED", {
      verifiedData: demographicData as any,
    });

    await auditService.log({
      userId: requesterId,
      action: AuditActions.FAYDA_VERIFY_CONFIRMED,
      entity: "FaydaVerification",
      entityId: verification.id,
      details: { nin: verification.nin, demographicData },
    });

    return {
      message: "Fayda verification successful.",
      demographicData,
      verificationToken,
    };
  },

  async confirmOtp(verificationId: string, otp: string, requesterId: string) {
    const verification = await faydaRepository.findById(verificationId);
    if (!verification) throw new NotFoundError("Verification record not found.");

    if (verification.status === "CONFIRMED") {
      throw new ConflictError("This verification has already been confirmed.");
    }

    if (verification.status === "FAILED" || verification.status === "EXPIRED") {
      throw new BadRequestError(
        "This verification has expired or failed. Please initiate a new one."
      );
    }

    // Check expiry
    if (verification.otpExpiresAt < new Date()) {
      await faydaRepository.updateStatus(verification.id, "EXPIRED");
      throw new BadRequestError("OTP has expired. Please initiate a new verification.");
    }

    // Check attempt limit
    if (verification.attempts >= MAX_ATTEMPTS) {
      await faydaRepository.updateStatus(verification.id, "FAILED");
      throw new BadRequestError("Maximum OTP attempts exceeded.");
    }

    // Wrong OTP
    if (verification.otp !== otp) {
      await faydaRepository.incrementAttempts(
        verification.id,
        verification.attempts + 1
      );
      const remaining = MAX_ATTEMPTS - verification.attempts - 1;
      throw new BadRequestError(
        `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
      );
    }

    // OTP is correct — fetch demographic data from mock gateway
    const demographicData = await faydaMockGateway.verifyOtpAndGetData(
      verification.nin
    );

    // Mark verification as confirmed
    await faydaRepository.updateStatus(verification.id, "CONFIRMED", {
      verifiedData: demographicData as any,
    });

    // Apply to athlete or coach
    if (verification.athleteId) {
      await prisma.athlete.update({
        where: { id: verification.athleteId },
        data: {
          faydaVerified:   true,
          faydaVerifiedAt: new Date(),
          faydaNin:        verification.nin,
          status:          "FAYDA_VERIFIED",
        },
      });

      await auditService.log({
        userId: requesterId,
        action: AuditActions.FAYDA_VERIFY_CONFIRMED,
        entity: "Athlete",
        entityId: verification.athleteId,
        details: { nin: verification.nin, demographicData },
      });

      const verificationToken = issueFaydaVerificationToken({
        nin: verification.nin,
        firstName: demographicData.firstName,
        lastName: demographicData.lastName,
        dateOfBirth: demographicData.dateOfBirth,
        gender: demographicData.gender,
        phoneNumber: demographicData.phoneNumber,
        fanNumber: demographicData.nin,
      });

      return {
        message: "Fayda verification successful. Athlete status updated to FAYDA_VERIFIED.",
        demographicData,
        verificationToken,
      };
    }

    if (verification.coachId) {
      await prisma.coach.update({
        where: { id: verification.coachId },
        data: {
          faydaVerified:   true,
          faydaVerifiedAt: new Date(),
          faydaNin:        verification.nin,
          status:          "FAYDA_VERIFIED",
        },
      });

      await auditService.log({
        userId: requesterId,
        action: AuditActions.FAYDA_VERIFY_CONFIRMED,
        entity: "Coach",
        entityId: verification.coachId,
        details: { nin: verification.nin, demographicData },
      });

      const verificationToken = issueFaydaVerificationToken({
        nin: verification.nin,
        firstName: demographicData.firstName,
        lastName: demographicData.lastName,
        dateOfBirth: demographicData.dateOfBirth,
        gender: demographicData.gender,
        phoneNumber: demographicData.phoneNumber,
        fanNumber: demographicData.nin,
      });

      return {
        message: "Fayda verification successful. Coach status updated to FAYDA_VERIFIED.",
        demographicData,
        verificationToken,
      };
    }

    throw new BadRequestError("Verification record has no associated athlete or coach.");
  },

  /**
   * Get verification status for an athlete
   */
  async getStatusForAthlete(athleteId: string) {
    const v = await faydaRepository.findLatestByAthlete(athleteId);
    if (!v) throw new NotFoundError("No verification record found for this athlete.");
    return v;
  },

  /**
   * Get verification status for a coach
   */
  async getStatusForCoach(coachId: string) {
    const v = await faydaRepository.findLatestByCoach(coachId);
    if (!v) throw new NotFoundError("No verification record found for this coach.");
    return v;
  },

  /**
   * Get verification record by id (public)
   */
  async getVerificationById(verificationId: string) {
    const v = await faydaRepository.findById(verificationId);
    if (!v) throw new NotFoundError("Verification record not found.");
    return v;
  },
};
