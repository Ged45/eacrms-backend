import jwt from "jsonwebtoken";

export interface FaydaVerificationTokenPayload {
  nin: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  fanNumber?: string;
  exp?: number;
  iat?: number;
}

export interface MobileLoginResponse {
  token: string;
  userId: string;
  userRole: string;
  userName?: string;
  fanNumber?: string;
  clubId?: string;
  clubName?: string;
  refreshToken: string;
  status: string;
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    roles: string[];
  };
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret";
  return secret;
}

export function buildLoginResponse(input: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  fanNumber?: string;
  clubId?: string;
  clubName?: string;
}): MobileLoginResponse {
  const userRole = (input.roles[0] ?? "ATHLETE")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const normalizedRole = {
    Athlete: "athlete",
    Club: "clubAdmin",
    Federation: "federationAdmin",
  }[userRole] ?? userRole;

  return {
    token: input.accessToken,
    accessToken: input.accessToken,
    userId: input.userId,
    userRole: normalizedRole,
    userName: `${input.firstName} ${input.lastName}`.trim(),
    fanNumber: input.fanNumber,
    clubId: input.clubId,
    clubName: input.clubName,
    refreshToken: input.refreshToken,
    status: input.status,
    user: {
      id: input.userId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      status: input.status,
      roles: input.roles,
    },
  };
}

export function issueFaydaVerificationToken(payload: FaydaVerificationTokenPayload): string {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: "30m",
  });
}

export function verifyFaydaVerificationToken(token: string): FaydaVerificationTokenPayload {
  return jwt.verify(token, getAccessSecret()) as FaydaVerificationTokenPayload;
}
