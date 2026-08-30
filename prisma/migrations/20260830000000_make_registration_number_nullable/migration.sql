-- Make registrationNumber nullable to match Prisma schema
ALTER TABLE "Club" ALTER COLUMN "registrationNumber" DROP NOT NULL;
