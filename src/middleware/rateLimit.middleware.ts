import rateLimit from "express-rate-limit";

/**
 * General public API rate limiter.
 * 100 requests per minute per IP.
 */
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/**
 * Strict rate limiter for write operations (uploads, POST/PUT/DELETE).
 * 20 requests per minute per IP.
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many write requests. Please try again later.",
  },
});

/**
 * Upload rate limiter.
 * 10 uploads per minute per IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many uploads. Please try again later.",
  },
});

/**
 * Search rate limiter (more generous for browsing).
 * 60 requests per minute per IP.
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many search requests. Please try again later.",
  },
});
