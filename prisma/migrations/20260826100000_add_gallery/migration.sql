-- CreateEnum: Create GalleryCategory enum
CREATE TYPE "GalleryCategory" AS ENUM ('CHAMPIONSHIP', 'MARATHON', 'ROAD_RACE', 'TRAINING', 'NATIONAL_TEAM', 'HISTORIC');

-- CreateEnum: Create MediaType enum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateTable: Create Gallery table
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amharicTitle" TEXT,
    "category" "GalleryCategory" NOT NULL,
    "type" "MediaType" NOT NULL,
    "coverImage" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "photographer" TEXT,
    "videoUrl" TEXT,
    "videoDuration" TEXT,
    "capturesCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Create GalleryCapture table
CREATE TABLE "GalleryCapture" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "title" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "photographer" TEXT,
    "timestamp" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryCapture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Create indexes on Gallery
CREATE INDEX "Gallery_category_idx" ON "Gallery"("category");
CREATE INDEX "Gallery_type_idx" ON "Gallery"("type");
CREATE INDEX "Gallery_isFeatured_idx" ON "Gallery"("isFeatured");
CREATE INDEX "Gallery_eventDate_idx" ON "Gallery"("eventDate");

-- CreateIndex: Create index on GalleryCapture
CREATE INDEX "GalleryCapture_galleryId_idx" ON "GalleryCapture"("galleryId");

-- AddForeignKey: Link GalleryCapture to Gallery
ALTER TABLE "GalleryCapture" ADD CONSTRAINT "GalleryCapture_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
