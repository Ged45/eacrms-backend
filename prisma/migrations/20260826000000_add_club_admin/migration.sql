-- AlterTable: Add adminId column to Club table
ALTER TABLE "Club" ADD COLUMN "adminId" TEXT;

-- CreateIndex: Unique constraint on adminId
CREATE UNIQUE INDEX "Club_adminId_key" ON "Club"("adminId");

-- AddForeignKey: Link Club.adminId to User.id
ALTER TABLE "Club" ADD CONSTRAINT "Club_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
