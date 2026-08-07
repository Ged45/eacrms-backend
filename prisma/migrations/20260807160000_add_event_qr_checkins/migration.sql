CREATE TYPE "EventAttendeeType" AS ENUM ('ATHLETE', 'CLUB');

CREATE TABLE "EventAttendee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attendeeType" "EventAttendeeType" NOT NULL,
    "athleteId" TEXT,
    "clubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventAttendee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventQrToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "generatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventQrToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventCheckIn" (
    "id" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInById" TEXT NOT NULL,
    CONSTRAINT "EventCheckIn_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventAttendee_eventId_athleteId_key" ON "EventAttendee"("eventId", "athleteId");
CREATE UNIQUE INDEX "EventAttendee_eventId_clubId_key" ON "EventAttendee"("eventId", "clubId");
CREATE INDEX "EventAttendee_eventId_attendeeType_idx" ON "EventAttendee"("eventId", "attendeeType");
CREATE UNIQUE INDEX "EventQrToken_token_key" ON "EventQrToken"("token");
CREATE INDEX "EventQrToken_token_idx" ON "EventQrToken"("token");
CREATE INDEX "EventQrToken_expiresAt_idx" ON "EventQrToken"("expiresAt");
CREATE UNIQUE INDEX "EventCheckIn_attendeeId_key" ON "EventCheckIn"("attendeeId");
CREATE INDEX "EventCheckIn_checkedInAt_idx" ON "EventCheckIn"("checkedInAt");

ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_athleteId_fkey"
  FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventQrToken" ADD CONSTRAINT "EventQrToken_attendeeId_fkey"
  FOREIGN KEY ("attendeeId") REFERENCES "EventAttendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventQrToken" ADD CONSTRAINT "EventQrToken_generatedById_fkey"
  FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventCheckIn" ADD CONSTRAINT "EventCheckIn_attendeeId_fkey"
  FOREIGN KEY ("attendeeId") REFERENCES "EventAttendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventCheckIn" ADD CONSTRAINT "EventCheckIn_checkedInById_fkey"
  FOREIGN KEY ("checkedInById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Permission" ("id", "name", "description", "createdAt", "updatedAt")
VALUES ('event_checkin_permission', 'event:checkin', 'Generate QR tokens and check attendees in', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
JOIN "Permission" p ON p."name" = 'event:checkin'
WHERE r."name" IN ('SUPER_ADMIN', 'FEDERATION_ADMIN', 'EVENT_MANAGER')
ON CONFLICT DO NOTHING;
