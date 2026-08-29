import { ClubVerificationStatus, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";

import { clubRepository } from "./club.repository";
import { authRepository } from "../auth/auth.repository";
import { verificationService } from "../verification/verification.service";

import { RegisterClubDTO, RegisterClubAdminDTO, ApproveClubDTO, RejectClubDTO } from "./club.types";

import { auditService } from "../audit/audit.service";
import { AuditActions } from "../../constants/audit-actions";
import { cacheGet, cacheInvalidate } from "../../lib/redis";
import { normalizePhoneNumber } from "../../utils/phone";

const SALT_ROUNDS = 12;

interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export const clubService = {
  /**
   * --------------------------------------------------
   * Register Club
   * --------------------------------------------------
   */
  async register(
    data: RegisterClubDTO,
    metadata?: RequestMetadata
  ) {
    // Check duplicate name
    const existingName = await clubRepository.findByName(data.name);

    if (existingName) {
      throw new Error("Club name already exists.");
    }

    // Check duplicate email
    if (data.email) {
      const existingEmail = await clubRepository.findByEmail(data.email);

      if (existingEmail) {
        throw new Error("Club email already exists.");
      }
    }

    // Check duplicate license
    if (data.licenseNumber) {
      const existingLicense = await clubRepository.findByLicense(
        data.licenseNumber
      );

      if (existingLicense) {
        throw new Error("License number already exists.");
      }
    }

    // Create Club
    const club = await clubRepository.create({
      name: data.name,
      shortName: data.shortName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      region: data.region,
      licenseNumber: data.licenseNumber,
      logoUrl: data.logoUrl,
    });

    // TODO: Audit log skipped — no userId available for anonymous club registration

    return club;
  },

  /**
   * --------------------------------------------------
   * Register Club Admin (User + Club in one step)
   * --------------------------------------------------
   */
  async registerAdmin(
    data: RegisterClubAdminDTO,
    metadata?: RequestMetadata
  ) {
    // Normalize phone number
    const phoneNumber = data.phoneNumber
      ? normalizePhoneNumber(data.phoneNumber)
      : undefined;

    // Check for existing user by email or phone
    const existingUser = data.email
      ? await authRepository.findUserByEmail(data.email)
      : phoneNumber
        ? await authRepository.findUserByPhone(phoneNumber)
        : null;

    if (existingUser) {
      throw new Error("Email or phone number already exists.");
    }

    // Check duplicate club name
    const existingClubName = await clubRepository.findByName(data.clubName);
    if (existingClubName) {
      throw new Error("Club name already exists.");
    }

    // Check duplicate club email
    if (data.clubEmail) {
      const existingClubEmail = await clubRepository.findByEmail(data.clubEmail);
      if (existingClubEmail) {
        throw new Error("Club email already exists.");
      }
    }

    // Check duplicate license
    if (data.licenseNumber) {
      const existingLicense = await clubRepository.findByLicense(data.licenseNumber);
      if (existingLicense) {
        throw new Error("License number already exists.");
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create User + Club + UserRole in a transaction
    const result = await authRepository.createUserWithClubAdmin({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber,
      clubData: {
        name: data.clubName,
        shortName: data.clubShortName,
        email: data.clubEmail,
        phone: data.clubPhone,
        address: data.clubAddress,
        city: data.clubCity,
        region: data.clubRegion,
        licenseNumber: data.licenseNumber,
        logoUrl: data.logoUrl,
      },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    // Initiate verification (email or phone)
    const verification = result.user.email
      ? await verificationService.initiateEmailVerification(result.user.id, result.user.email)
      : await verificationService.initiatePhoneVerification(result.user.id, result.user.phoneNumber!);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phoneNumber: result.user.phoneNumber,
        status: result.user.status,
      },
      club: result.club,
      verification,
    };
  },

  /**
   * --------------------------------------------------
   * Get Club By ID
   * --------------------------------------------------
   */
  async findById(id: string) {
    const club = await clubRepository.findById(id);

    if (!club) {
      throw new Error("Club not found.");
    }

    return club;
  },

  /**
   * --------------------------------------------------
   * Get Verified Clubs (Public, cached)
   * --------------------------------------------------
   */
  async findVerifiedCached(query?: {
    search?: string;
    region?: string;
    city?: string;
    limit?: number;
  }) {
    const cacheKey = `clubs:public:verified:${JSON.stringify(query || {})}`;
    return cacheGet(cacheKey, 300, () => clubRepository.findVerified(query));
  },

  /**
   * --------------------------------------------------
   * Get Club By ID (Public, cached)
   * --------------------------------------------------
   */
  async findByIdCached(id: string) {
    const cacheKey = `clubs:public:detail:${id}`;
    const club = await cacheGet(cacheKey, 300, () => clubRepository.findById(id));
    if (!club) {
      throw new Error("Club not found.");
    }
    return club;
  },

  /**
   * --------------------------------------------------
   * Get All Clubs
   * --------------------------------------------------
   */
  async findAll() {
    return clubRepository.findAll();
  },

  /**
   * --------------------------------------------------
   * Get Pending Clubs
   * --------------------------------------------------
   */
  async findPending() {
    return clubRepository.findPending();
  },

  /**
   * --------------------------------------------------
   * Get Verified Clubs
   * --------------------------------------------------
   */
  async findVerified() {
    return clubRepository.findVerified();
  },

  /**
   * --------------------------------------------------
   * Approve Club
   * --------------------------------------------------
   */
  async approve(
    id: string,
    dto: ApproveClubDTO,
    metadata?: RequestMetadata
  ) {
    const club = await clubRepository.findById(id);

    if (!club) {
      throw new Error("Club not found.");
    }

    if (
      club.verificationStatus ===
      ClubVerificationStatus.VERIFIED
    ) {
      throw new Error("Club is already verified.");
    }

    const updatedClub = await clubRepository.approve(
      id,
      dto.approvedBy
    );

    await cacheInvalidate(`clubs:public:detail:${id}`);
    await cacheInvalidate("clubs:public:verified:*");

    await auditService.log({
      userId: dto.approvedBy,
      action: AuditActions.CLUB_APPROVED,
      entity: "Club",
      entityId: id,
      details: {
        status: "VERIFIED",
      },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return updatedClub;
  },

  /**
   * --------------------------------------------------
   * Reject Club
   * --------------------------------------------------
   */
  async reject(
    id: string,
    dto: RejectClubDTO,
    metadata?: RequestMetadata
  ) {
    const club = await clubRepository.findById(id);

    if (!club) {
      throw new Error("Club not found.");
    }

    if (
      club.verificationStatus ===
      ClubVerificationStatus.REJECTED
    ) {
      throw new Error("Club is already rejected.");
    }

    const updatedClub = await clubRepository.reject(
      id,
      dto.reason
    );

    await cacheInvalidate(`clubs:public:detail:${id}`);
    await cacheInvalidate("clubs:public:verified:*");

    await auditService.log({
      userId: dto.rejectedBy,
      action: AuditActions.CLUB_REJECTED,
      entity: "Club",
      entityId: id,
      details: {
        reason: dto.reason,
      },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return updatedClub;
  },

  /**
   * --------------------------------------------------
   * Suspend Club
   * --------------------------------------------------
   */
  async suspend(
    id: string,
    userId: string,
    metadata?: RequestMetadata
  ) {
    const club = await clubRepository.findById(id);

    if (!club) {
      throw new Error("Club not found.");
    }

    if (
      club.verificationStatus ===
      ClubVerificationStatus.SUSPENDED
    ) {
      throw new Error("Club is already suspended.");
    }

    const updatedClub = await clubRepository.suspend(id);

    await cacheInvalidate(`clubs:public:detail:${id}`);
    await cacheInvalidate("clubs:public:verified:*");

    await auditService.log({
      userId,
      action: AuditActions.CLUB_SUSPENDED,
      entity: "Club",
      entityId: id,
      details: {
        status: "SUSPENDED",
      },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return updatedClub;
  },

  /**
   * --------------------------------------------------
   * Delete Club
   * --------------------------------------------------
   */
  async delete(id: string) {
    const club = await clubRepository.findById(id);

    if (!club) {
      throw new Error("Club not found.");
    }

    return clubRepository.delete(id);
  },
};