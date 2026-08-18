-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('CHAMPIONSHIP', 'TRAINING', 'ANNOUNCEMENT', 'COMMUNITY', 'RECOGNITION', 'GENERAL');

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL DEFAULT 'GENERAL',
    "imageUrl" TEXT,
    "insideImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author" TEXT NOT NULL DEFAULT 'EAF Communications Department',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "News_category_idx" ON "News"("category");

-- CreateIndex
CREATE INDEX "News_isFeatured_idx" ON "News"("isFeatured");

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");
