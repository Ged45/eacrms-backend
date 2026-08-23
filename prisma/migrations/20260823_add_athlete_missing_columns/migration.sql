-- Add missing columns to Athlete table
ALTER TABLE "Athlete" ADD COLUMN "clubName" TEXT,
ADD COLUMN "region" TEXT,
ADD COLUMN "emergencyContactPhone" TEXT;
