UPDATE "User"
SET "status" = 'ACTIVE'
WHERE "status" = 'PENDING'
  AND ("emailVerified" = true OR "phoneVerified" = true);
