-- AlterTable
ALTER TABLE "Event" ADD COLUMN "disciplines" JSONB,
ADD COLUMN "bannerUrl" TEXT,
ADD COLUMN "registrationDeadline" TIMESTAMP(3);
