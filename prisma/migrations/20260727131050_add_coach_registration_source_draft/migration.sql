-- Add new enum types (idempotent via DO blocks)
DO $$ BEGIN
  CREATE TYPE "RegistrationSource" AS ENUM ('SELF', 'CLUB_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ClubVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add DRAFT to AthleteStatus (idempotent)
DO $$ BEGIN
  ALTER TYPE "AthleteStatus" ADD VALUE 'DRAFT' BEFORE 'PENDING';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
