export interface RegisterDTO {
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  verificationMethod?: "email" | "phone";
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginDTO {
  identifier: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}