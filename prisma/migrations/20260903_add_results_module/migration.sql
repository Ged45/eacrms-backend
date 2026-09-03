-- CreateEnum
CREATE TYPE "ResultCategory" AS ENUM ('TRACK', 'FIELD', 'ROAD', 'CROSS_COUNTRY');

-- CreateEnum
CREATE TYPE "ResultGender" AS ENUM ('MEN', 'WOMEN', 'MIXED');

-- CreateEnum
CREATE TYPE "LiveStatusType" AS ENUM ('ERROR', 'WARNING', 'SUCCESS', 'INFO');

-- CreateTable
CREATE TABLE "LiveEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "overallStatusLabel" TEXT NOT NULL DEFAULT 'LIVE NOW',
    "overallStatusType" "LiveStatusType" NOT NULL DEFAULT 'SUCCESS',
    "competitionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveCompetition" (
    "id" TEXT NOT NULL,
    "liveEventId" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "gender" "ResultGender" NOT NULL,
    "category" "ResultCategory" NOT NULL,
    "statusLabel" TEXT NOT NULL DEFAULT 'In Progress',
    "statusType" "LiveStatusType" NOT NULL DEFAULT 'SUCCESS',
    "elapsedTime" TEXT NOT NULL,
    "progressLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveCompetition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveLeaderboardEntry" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bib" TEXT NOT NULL,
    "club" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "diff" TEXT NOT NULL DEFAULT '--',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveLeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "category" "ResultCategory" NOT NULL,
    "gender" "ResultGender" NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "statusLabel" TEXT NOT NULL DEFAULT 'Official Result',
    "statusType" "LiveStatusType" NOT NULL DEFAULT 'SUCCESS',
    "totalFinishers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultFinisher" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "performance" TEXT NOT NULL,
    "club" TEXT NOT NULL,
    "nationality" TEXT,
    "notes" TEXT,
    "athleteId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResultFinisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamRanking" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NationalRecord" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "record" TEXT NOT NULL,
    "athlete" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "club" TEXT,
    "previousRecord" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NationalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PastSeason" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "winnerClub" TEXT NOT NULL,
    "runnerUpClub" TEXT,
    "location" TEXT,
    "date" TIMESTAMP(3),
    "totalEvents" TEXT,
    "topAthlete" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PastSeason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveEvent_date_idx" ON "LiveEvent"("date");

-- CreateIndex
CREATE INDEX "LiveCompetition_liveEventId_idx" ON "LiveCompetition"("liveEventId");

-- CreateIndex
CREATE INDEX "LiveLeaderboardEntry_competitionId_idx" ON "LiveLeaderboardEntry"("competitionId");

-- CreateIndex
CREATE INDEX "Result_date_idx" ON "Result"("date");

-- CreateIndex
CREATE INDEX "Result_category_idx" ON "Result"("category");

-- CreateIndex
CREATE INDEX "Result_isLive_idx" ON "Result"("isLive");

-- CreateIndex
CREATE INDEX "ResultFinisher_resultId_idx" ON "ResultFinisher"("resultId");

-- CreateIndex
CREATE INDEX "ResultFinisher_athleteId_idx" ON "ResultFinisher"("athleteId");

-- CreateIndex
CREATE INDEX "TeamRanking_resultId_idx" ON "TeamRanking"("resultId");

-- CreateIndex
CREATE INDEX "NationalRecord_event_idx" ON "NationalRecord"("event");

-- CreateIndex
CREATE INDEX "PastSeason_year_idx" ON "PastSeason"("year");

-- AddForeignKey
ALTER TABLE "LiveCompetition" ADD CONSTRAINT "LiveCompetition_liveEventId_fkey" FOREIGN KEY ("liveEventId") REFERENCES "LiveEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveLeaderboardEntry" ADD CONSTRAINT "LiveLeaderboardEntry_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "LiveCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultFinisher" ADD CONSTRAINT "ResultFinisher_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRanking" ADD CONSTRAINT "TeamRanking_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
