CREATE TYPE "PolicyScope" AS ENUM ('CLUB', 'EVENT', 'ATHLETE_PARTICIPATION');
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "PolicyAuditAction" AS ENUM ('CREATED', 'UPDATED', 'ASSIGNED', 'UNASSIGNED');

CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scope" "PolicyScope" NOT NULL,
    "rules" JSONB NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PolicyAssignment" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "clubId" TEXT,
    "eventId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicyAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PolicyAuditLog" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "action" "PolicyAuditAction" NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicyAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Policy_code_key" ON "Policy"("code");
CREATE INDEX "Policy_scope_status_idx" ON "Policy"("scope", "status");
CREATE UNIQUE INDEX "PolicyAssignment_policyId_clubId_key" ON "PolicyAssignment"("policyId", "clubId");
CREATE UNIQUE INDEX "PolicyAssignment_policyId_eventId_key" ON "PolicyAssignment"("policyId", "eventId");
CREATE INDEX "PolicyAssignment_clubId_idx" ON "PolicyAssignment"("clubId");
CREATE INDEX "PolicyAssignment_eventId_idx" ON "PolicyAssignment"("eventId");
CREATE INDEX "PolicyAuditLog_policyId_createdAt_idx" ON "PolicyAuditLog"("policyId", "createdAt");

ALTER TABLE "Policy" ADD CONSTRAINT "Policy_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PolicyAssignment" ADD CONSTRAINT "PolicyAssignment_policyId_fkey"
  FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PolicyAssignment" ADD CONSTRAINT "PolicyAssignment_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PolicyAssignment" ADD CONSTRAINT "PolicyAssignment_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PolicyAssignment" ADD CONSTRAINT "PolicyAssignment_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PolicyAuditLog" ADD CONSTRAINT "PolicyAuditLog_policyId_fkey"
  FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PolicyAuditLog" ADD CONSTRAINT "PolicyAuditLog_changedById_fkey"
  FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Permission" ("id", "name", "description", "createdAt", "updatedAt")
VALUES
  ('policy_create_permission', 'policy:create', 'Create federation policies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('policy_update_permission', 'policy:update', 'Update and assign federation policies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('policy_view_permission', 'policy:view', 'View all federation policies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
JOIN "Permission" p ON p."name" IN ('policy:create', 'policy:update', 'policy:view')
WHERE r."name" IN ('SUPER_ADMIN', 'FEDERATION_ADMIN')
ON CONFLICT DO NOTHING;
