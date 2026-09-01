-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESPONDED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContactSubject" AS ENUM ('GENERAL_INQUIRY', 'ATHLETE_REGISTRATION', 'CLUB_REGISTRATION', 'EVENT_INQUIRY', 'PAYMENT_ISSUE', 'TECHNICAL_SUPPORT', 'MEDIA_INQUIRY', 'PARTNERSHIP', 'COMPLAINT', 'FEEDBACK');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINAL', 'CERTIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResultVersionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINAL');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('SCORE_CHANGE', 'PENALTY', 'WARNING', 'DISQUALIFICATION', 'INJURY', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" "ContactSubject" NOT NULL,
    "message" TEXT NOT NULL,
    "relatedTo" TEXT,
    "relatedId" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventResult" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'SCHEDULED',
    "homeTeam" TEXT,
    "awayTeam" TEXT,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "certifiedById" TEXT,
    "certifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventResultVersion" (
    "id" TEXT NOT NULL,
    "eventResultId" TEXT NOT NULL,
    "status" "ResultVersionStatus" NOT NULL DEFAULT 'LIVE',
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "updatedByRole" TEXT,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventResultVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventResultIncident" (
    "id" TEXT NOT NULL,
    "eventResultId" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "relatedPlayer" TEXT,
    "relatedTeam" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventResultIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactSubmission_referenceNumber_key" ON "ContactSubmission"("referenceNumber");

-- CreateIndex
CREATE INDEX "ContactSubmission_status_idx" ON "ContactSubmission"("status");

-- CreateIndex
CREATE INDEX "ContactSubmission_subject_idx" ON "ContactSubmission"("subject");

-- CreateIndex
CREATE INDEX "ContactSubmission_referenceNumber_idx" ON "ContactSubmission"("referenceNumber");

-- CreateIndex
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventResult_eventId_key" ON "EventResult"("eventId");

-- CreateIndex
CREATE INDEX "EventResult_eventId_idx" ON "EventResult"("eventId");

-- CreateIndex
CREATE INDEX "EventResult_status_idx" ON "EventResult"("status");

-- CreateIndex
CREATE INDEX "EventResultVersion_eventResultId_createdAt_idx" ON "EventResultVersion"("eventResultId", "createdAt");

-- CreateIndex
CREATE INDEX "EventResultIncident_eventResultId_createdAt_idx" ON "EventResultIncident"("eventResultId", "createdAt");

-- AddForeignKey
ALTER TABLE "ContactSubmission" ADD CONSTRAINT "ContactSubmission_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResult" ADD CONSTRAINT "EventResult_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResult" ADD CONSTRAINT "EventResult_certifiedById_fkey" FOREIGN KEY ("certifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResultVersion" ADD CONSTRAINT "EventResultVersion_eventResultId_fkey" FOREIGN KEY ("eventResultId") REFERENCES "EventResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResultVersion" ADD CONSTRAINT "EventResultVersion_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResultIncident" ADD CONSTRAINT "EventResultIncident_eventResultId_fkey" FOREIGN KEY ("eventResultId") REFERENCES "EventResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResultIncident" ADD CONSTRAINT "EventResultIncident_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
