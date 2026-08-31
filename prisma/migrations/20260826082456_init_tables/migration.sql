-- Reconcile schema objects that were applied to the development database.
CREATE TABLE "AthleteSport" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AthleteSport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AthleteSport_athleteId_sportId_key" ON "AthleteSport"("athleteId", "sportId");
CREATE INDEX "AthleteSport_athleteId_idx" ON "AthleteSport"("athleteId");
CREATE INDEX "AthleteSport_sportId_idx" ON "AthleteSport"("sportId");

ALTER TABLE "AthleteSport" ADD CONSTRAINT "AthleteSport_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AthleteSport" ADD CONSTRAINT "AthleteSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Club" ALTER COLUMN "registrationNumber" DROP NOT NULL;
ALTER TABLE "Coach" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "FaydaVerification" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "UserVerification" ALTER COLUMN "updatedAt" DROP DEFAULT;