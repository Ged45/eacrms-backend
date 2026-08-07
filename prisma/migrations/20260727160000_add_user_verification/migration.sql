-- CreateEnum (idempotent)
DO $$ BEGIN
  CREATE TYPE "VerificationType" AS ENUM ('EMAIL', 'PHONE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: User — add verification fields
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "emailVerified"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "phoneVerified"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);

-- CreateTable: UserVerification
CREATE TABLE IF NOT EXISTS "UserVerification" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "type"      "VerificationType" NOT NULL,
    "code"      TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status"    "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserVerification_userId_idx" ON "UserVerification"("userId");
CREATE INDEX IF NOT EXISTS "UserVerification_code_idx"   ON "UserVerification"("code");

ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
