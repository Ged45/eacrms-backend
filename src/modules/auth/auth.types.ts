export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  ipAddress?: string;
 userAgent?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}