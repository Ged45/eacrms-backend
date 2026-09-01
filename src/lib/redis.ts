import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let redisLastErrorLog = 0;

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  lazyConnect: true,
});

redis.on("error", (err) => {
  // Throttle error logging — at most once per 30 seconds
  const now = Date.now();
  if (now - redisLastErrorLog > 30_000) {
    redisLastErrorLog = now;
    console.error(`⚠️  Redis connection error (${REDIS_URL}):`, err.message);
  }
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
  redisLastErrorLog = 0;
});

/**
 * Get a cached value by key, or execute the fallback and cache the result.
 *
 * @param key - cache key
 * @param ttlSeconds - time-to-live in seconds
 * @param fallback - async function to compute the value on cache miss
 */
export async function cacheGet<T>(
  key: string,
  ttlSeconds: number,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Redis unavailable — fall through to DB
  }

  const value = await fallback();

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Redis write failed — non-critical
  }

  return value;
}

/**
 * Invalidate all keys matching a pattern.
 */
export async function cacheInvalidate(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Redis unavailable — non-critical
  }
}

// ─── Refresh Token Storage ──────────────────────────────────────────────

const REFRESH_TOKEN_PREFIX = "refresh:";
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Store a refresh token in Redis.
 * @param token - the refresh token JWT
 * @param userId - the user ID
 */
export async function storeRefreshToken(token: string, userId: string): Promise<void> {
  try {
    await redis.set(
      `${REFRESH_TOKEN_PREFIX}${token}`,
      userId,
      "EX",
      REFRESH_TOKEN_TTL_SECONDS
    );
  } catch {
    // Redis unavailable — non-critical
  }
}

/**
 * Check if a refresh token exists in Redis (is valid/not revoked).
 * @param token - the refresh token JWT
 * @returns userId if valid, null otherwise
 */
export async function getRefreshToken(token: string): Promise<string | null> {
  try {
    return await redis.get(`${REFRESH_TOKEN_PREFIX}${token}`);
  } catch {
    return null;
  }
}

/**
 * Revoke a refresh token from Redis.
 * @param token - the refresh token JWT
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  try {
    await redis.del(`${REFRESH_TOKEN_PREFIX}${token}`);
  } catch {
    // Redis unavailable — non-critical
  }
}

/**
 * Revoke all refresh tokens for a user.
 * @param userId - the user ID
 */
export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  try {
    const keys = await redis.keys(`${REFRESH_TOKEN_PREFIX}*`);
    for (const key of keys) {
      const storedUserId = await redis.get(key);
      if (storedUserId === userId) {
        await redis.del(key);
      }
    }
  } catch {
    // Redis unavailable — non-critical
  }
}

export default redis;
