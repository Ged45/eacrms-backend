-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "FaydaVerificationStatus" AS ENUM ('PENDING', 'OTP_SENT', 'CONFIRMED', 'FAILED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: Athlete — add faydaNin
ALTER TABLE "Athlete"
  ADD COLUMN IF NOT EXISTS "faydaNin" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Athlete_faydaNin_key" ON "Athlete"("faydaNin");

-- AlterTable: Coach — add fayda fields
ALTER TABLE "Coach"
  ADD COLUMN IF NOT EXISTS "faydaVerified"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "faydaVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "faydaNin"        TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Coach_faydaNin_key" ON "Coach"("faydaNin");

-- CreateTable: FaydaVerification
CREATE TABLE IF NOT EXISTS "FaydaVerification" (
    "id"           TEXT NOT NULL,
    "athleteId"    TEXT,
    "coachId"      TEXT,
    "nin"          TEXT NOT NULL,
    "otp"          TEXT NOT NULL,
    "otpExpiresAt" TIMESTAMP(3) NOT NULL,
    "status"       "FaydaVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedData" JSONB,
    "attempts"     INTEGER NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaydaVerification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FaydaVerification_athleteId_idx" ON "FaydaVerification"("athleteId");
CREATE INDEX IF NOT EXISTS "FaydaVerification_coachId_idx"   ON "FaydaVerification"("coachId");

-- AddForeignKey
ALTER TABLE "FaydaVerification" ADD CONSTRAINT "FaydaVerification_athleteId_fkey"
    FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FaydaVerification" ADD CONSTRAINT "FaydaVerification_coachId_fkey"
    FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;
