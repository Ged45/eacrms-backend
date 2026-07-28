-- Step 2: Now that DRAFT is committed, we can use it as a default and create tables.

-- AlterTable: Athlete — add registrationSource, registeredById; change default status to DRAFT
ALTER TABLE "Athlete"
  ADD COLUMN IF NOT EXISTS "registrationSource" "RegistrationSource" NOT NULL DEFAULT 'SELF',
  ADD COLUMN IF NOT EXISTS "registeredById"     TEXT;

ALTER TABLE "Athlete" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable: Club — add new fields
ALTER TABLE "Club"
  ADD COLUMN IF NOT EXISTS "shortName"          TEXT,
  ADD COLUMN IF NOT EXISTS "email"              TEXT,
  ADD COLUMN IF NOT EXISTS "phone"              TEXT,
  ADD COLUMN IF NOT EXISTS "address"            TEXT,
  ADD COLUMN IF NOT EXISTS "city"               TEXT,
  ADD COLUMN IF NOT EXISTS "region"             TEXT,
  ADD COLUMN IF NOT EXISTS "licenseNumber"      TEXT,
  ADD COLUMN IF NOT EXISTS "logoUrl"            TEXT,
  ADD COLUMN IF NOT EXISTS "verificationStatus" "ClubVerificationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "verifiedBy"         TEXT,
  ADD COLUMN IF NOT EXISTS "verifiedAt"         TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectionReason"    TEXT;

-- CreateIndex: Club
CREATE UNIQUE INDEX IF NOT EXISTS "Club_email_key"         ON "Club"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Club_licenseNumber_key" ON "Club"("licenseNumber");
CREATE INDEX IF NOT EXISTS "Club_verificationStatus_idx"   ON "Club"("verificationStatus");
CREATE INDEX IF NOT EXISTS "Club_name_idx"                 ON "Club"("name");

-- CreateTable: Coach
CREATE TABLE IF NOT EXISTS "Coach" (
    "id"                TEXT NOT NULL,
    "userId"            TEXT NOT NULL,
    "sportId"           TEXT,
    "clubId"            TEXT,
    "licenseNumber"     TEXT,
    "specialization"    TEXT,
    "yearsOfExperience" INTEGER,
    "registrationSource" "RegistrationSource" NOT NULL DEFAULT 'SELF',
    "registeredById"    TEXT,
    "status"            "AthleteStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Coach_userId_key" ON "Coach"("userId");

-- AddForeignKey: Athlete.registeredById -> User
ALTER TABLE "Athlete" DROP CONSTRAINT IF EXISTS "Athlete_registeredById_fkey";
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_registeredById_fkey"
    FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Club.verifiedBy -> User
ALTER TABLE "Club" DROP CONSTRAINT IF EXISTS "Club_verifiedBy_fkey";
ALTER TABLE "Club" ADD CONSTRAINT "Club_verifiedBy_fkey"
    FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Coach -> User, Sport, Club, registeredBy
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Coach" ADD CONSTRAINT "Coach_sportId_fkey"
    FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Coach" ADD CONSTRAINT "Coach_clubId_fkey"
    FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Coach" ADD CONSTRAINT "Coach_registeredById_fkey"
    FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
