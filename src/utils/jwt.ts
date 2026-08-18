import jwt from "jsonwebtoken";

export interface JwtPayload {
    userId: string;
    email?: string | null;
    roles: string[];
}

function getAccessSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error("JWT_ACCESS_SECRET is not set.");
    return secret;
}

function getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error("JWT_REFRESH_SECRET is not set.");
    return secret;
}

export function generateAccessToken(
    payload: JwtPayload
) {
    return jwt.sign(
        payload,
        getAccessSecret(),
        {
            expiresIn:
                (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m") as jwt.SignOptions["expiresIn"],
        }
    );
}

export function generateRefreshToken(
    payload: JwtPayload
) {
    return jwt.sign(
        payload,
        getRefreshSecret(),
        {
            expiresIn:
                (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
        }
    );
}

export function verifyAccessToken(
    token: string
) {
    return jwt.verify(
        token,
        getAccessSecret()
    ) as JwtPayload;
}

export function verifyRefreshToken(
    token: string
) {
    return jwt.verify(
        token,
        getRefreshSecret()
    ) as JwtPayload;
}