-- Event publishing is controlled by the federation approval workflow.
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'CANCELLED');

CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
    "venue" TEXT,
    "organizerName" TEXT NOT NULL,
    "organizerEmail" TEXT,
    "organizerPhone" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventStatusHistory" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "previousStatus" "EventStatus",
    "newStatus" "EventStatus" NOT NULL,
    "reason" TEXT,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Event_status_idx" ON "Event"("status");
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");
CREATE INDEX "Event_category_idx" ON "Event"("category");
CREATE INDEX "EventStatusHistory_eventId_createdAt_idx" ON "EventStatusHistory"("eventId", "createdAt");

ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventStatusHistory" ADD CONSTRAINT "EventStatusHistory_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventStatusHistory" ADD CONSTRAINT "EventStatusHistory_changedById_fkey"
  FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Make the workflow available immediately in deployed environments, where the
-- development seed script is not run.
INSERT INTO "Role" ("id", "name", "description", "createdAt", "updatedAt")
VALUES ('event_manager_role', 'EVENT_MANAGER', 'Create and manage events pending federation approval', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Permission" ("id", "name", "description", "createdAt", "updatedAt")
VALUES
  ('event_create_permission', 'event:create', 'Create and submit events', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('event_view_permission', 'event:view', 'View events and event status history', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('event_approve_permission', 'event:approve', 'Approve or reject submitted events', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('event_override_permission', 'event:override', 'Override an event status', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
JOIN "Permission" p ON p."name" IN ('event:create', 'event:view')
WHERE r."name" = 'EVENT_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
JOIN "Permission" p ON p."name" IN ('event:approve', 'event:view')
WHERE r."name" = 'FEDERATION_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
JOIN "Permission" p ON p."name" IN ('event:create', 'event:view', 'event:approve', 'event:override')
WHERE r."name" = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;
