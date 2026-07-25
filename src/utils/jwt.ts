import jwt from "jsonwebtoken";

const ACCESS_SECRET =
    process.env.JWT_ACCESS_SECRET!;

const REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET!;

export interface JwtPayload {
    userId: string;
    email: string;
    roles: string[];
}

export function generateAccessToken(
    payload: JwtPayload
) {
    return jwt.sign(
        payload,
        ACCESS_SECRET,
        {
            expiresIn:
                process.env.JWT_ACCESS_EXPIRES_IN,
        }
    );
}

export function generateRefreshToken(
    payload: JwtPayload
) {
    return jwt.sign(
        payload,
        REFRESH_SECRET,
        {
            expiresIn:
                process.env.JWT_REFRESH_EXPIRES_IN,
        }
    );
}

export function verifyAccessToken(
    token: string
) {
    return jwt.verify(
        token,
        ACCESS_SECRET
    ) as JwtPayload;
}

export function verifyRefreshToken(
    token: string
) {
    return jwt.verify(
        token,
        REFRESH_SECRET
    ) as JwtPayload;
}