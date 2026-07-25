import bcrypt from "bcrypt";
import { authRepository } from "./auth.repository";
import { LoginDTO, RegisterDTO } from "./auth.types";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { auditService } from "../audit/audit.service";

const SALT_ROUNDS = 12;

export const authService = {
  /**
   * ----------------------------------------
   * Register User
   * ----------------------------------------
   */
  async register(data: RegisterDTO) {
    const existingUser = await authRepository.findUserByEmail(data.email);
    await auditService.log({

    userId: user.id,

    action: AuditActions.REGISTER,

    entity: "User",

    entityId: user.id,

    ipAddress: request.ip,

    userAgent:
        request.get("user-agent"),

});

    if (existingUser) {
      throw new Error("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      SALT_ROUNDS
    );

    const user = await authRepository.createUserWithRole({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      roleName: "ATHLETE",
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: user.status,
      createdAt: user.createdAt,
    };
  },

  /**
   * ----------------------------------------
   * Login User
   * ----------------------------------------
   */
  async login(data: LoginDTO) {
    const user = await authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new Error("Invalid email or password.");
    }
    const payload = {

    userId: user.id,

    email: user.email,

    roles: user.roles.map(r => r.role.name),

};
const accessToken =
generateAccessToken(payload);

const refreshToken =
generateRefreshToken(payload);
    const passwordMatches = await bcrypt.compare(
      data.password,
      user.password
    );
await auditService.log({

    userId: user.id,

    action: AuditActions.LOGIN,

    entity: "User",

    entityId: user.id,

    ipAddress: request.ip,

    userAgent:
        request.get("user-agent"),

});
    if (!passwordMatches) {
      throw new Error("Invalid email or password.");
    }

    if (user.status !== "ACTIVE") {
      throw new Error(
        "Your account is not active."
      );
    }

    // JWT will be added in the next lesson

   return {

    user: {

        id: user.id,

        email: user.email,

        firstName: user.firstName,

        lastName: user.lastName,

    },

    accessToken,

    refreshToken,

};
  },

  /**
   * ----------------------------------------
   * Current User
   * ----------------------------------------
   */
  async me(userId: string) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: user.status,
      roles: user.roles.map((r) => r.role.name),
    };
  },
};