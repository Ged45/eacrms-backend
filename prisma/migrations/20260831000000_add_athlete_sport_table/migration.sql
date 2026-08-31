-- CreateTable
CREATE TABLE "AthleteSport" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AthleteSport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AthleteSport_athleteId_sportId_key" ON "AthleteSport"("athleteId", "sportId");

-- CreateIndex
CREATE INDEX "AthleteSport_athleteId_idx" ON "AthleteSport"("athleteId");

-- CreateIndex
CREATE INDEX "AthleteSport_sportId_idx" ON "AthleteSport"("sportId");

-- AddForeignKey
ALTER TABLE "AthleteSport" ADD CONSTRAINT "AthleteSport_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteSport" ADD CONSTRAINT "AthleteSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
