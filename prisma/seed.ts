import { PrismaClient, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

/**
 * ---------------------------------------------------
 * Roles
 * ---------------------------------------------------
 */

const roles = [
  {
    name: "SUPER_ADMIN",
    description: "Full access to the system",
  },
  {
    name: "FEDERATION_ADMIN",
    description: "Manage federation operations",
  },
  {
    name: "REGIONAL_ADMIN",
    description: "Manage regional operations",
  },
  {
    name: "CLUB_ADMIN",
    description: "Manage club activities",
  },
  {
    name: "COACH",
    description: "Manage athletes",
  },
  {
    name: "ATHLETE",
    description: "Athlete account",
  },
  {
    name: "REFEREE",
    description: "Competition official",
  },
  {
    name: "MEDICAL_STAFF",
    description: "Medical verification",
  },
  {
    name: "FINANCE_OFFICER",
    description: "Finance and payments",
  },
  {
    name: "EVENT_MANAGER",
    description: "Create and manage events pending federation approval",
  },
];

/**
 * ---------------------------------------------------
 * Permissions
 * ---------------------------------------------------
 */

const permissions = [
  // Users
  { name: "user:create", description: "Create users" },
  { name: "user:view", description: "View users" },
  { name: "user:update", description: "Update users" },
  { name: "user:delete", description: "Delete users" },

  // Roles
  { name: "role:create", description: "Create roles" },
  { name: "role:update", description: "Update roles" },
  { name: "role:delete", description: "Delete roles" },

  // Clubs
  { name: "club:create", description: "Create clubs" },
  { name: "club:update", description: "Update clubs" },
  { name: "club:approve", description: "Approve clubs" },
  { name: "club:delete", description: "Delete clubs" },

  // Athletes
  { name: "athlete:create", description: "Register athletes" },
  { name: "athlete:view", description: "View athletes" },
  { name: "athlete:update", description: "Update athletes" },
  { name: "athlete:delete", description: "Delete athletes" },

  // Coaches
  { name: "coach:create", description: "Register coaches" },
  { name: "coach:update", description: "Update coaches" },
  { name: "coach:view", description: "View coaches" },

  // Competitions
  { name: "competition:create", description: "Create competitions" },
  { name: "competition:update", description: "Update competitions" },
  { name: "competition:publish", description: "Publish competitions" },
  { name: "competition:view", description: "View competitions" },

  // Events
  { name: "event:create", description: "Create and submit events" },
  { name: "event:view", description: "View events and event status history" },
  { name: "event:approve", description: "Approve or reject submitted events" },
  { name: "event:override", description: "Override an event status" },
  { name: "event:checkin", description: "Generate QR tokens and check attendees in" },
  { name: "event:register", description: "Register athletes for events" },

  // Federation policies
  { name: "policy:create", description: "Create federation policies" },
  { name: "policy:update", description: "Update and assign federation policies" },
  { name: "policy:view", description: "View all federation policies" },

  // Payments
  { name: "payment:create", description: "Create payment" },
  { name: "payment:approve", description: "Approve payment" },
  { name: "payment:view", description: "View payments" },

  // Reports
  { name: "report:view", description: "View reports" },

  // Audit
  { name: "audit:view", description: "View audit logs" },

  // Fayda
  { name: "fayda:verify", description: "Verify Fayda ID" },
];

/**
 * ---------------------------------------------------
 * Role -> Permissions
 * ---------------------------------------------------
 */

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: permissions.map((p) => p.name),

  FEDERATION_ADMIN: [
    "club:create",
    "club:update",
    "club:approve",
    "athlete:create",
    "athlete:update",
    "coach:create",
    "coach:update",
    "competition:create",
    "competition:update",
    "competition:publish",
    "event:approve",
    "event:view",
    "event:checkin",
    "policy:create",
    "policy:update",
    "policy:view",
    "payment:approve",
    "report:view",
    "audit:view",
    "fayda:verify",
  ],

  REGIONAL_ADMIN: [
    "club:create",
    "club:update",
    "athlete:create",
    "coach:create",
    "competition:view",
    "report:view",
  ],

  CLUB_ADMIN: [
    "athlete:create",
    "athlete:update",
    "coach:create",
    "coach:update",
    "competition:view",
  ],

  COACH: [
    "athlete:view",
    "athlete:update",
    "competition:view",
  ],

  ATHLETE: [
    "competition:view",
    "event:register",
  ],

  EVENT_MANAGER: [
    "event:create",
    "event:view",
    "event:checkin",
    "event:register",
  ],

  REFEREE: [
    "competition:view",
    "report:view",
  ],

  MEDICAL_STAFF: [
    "athlete:view",
    "fayda:verify",
  ],

  FINANCE_OFFICER: [
    "payment:create",
    "payment:approve",
    "payment:view",
    "report:view",
  ],
};

async function seedRoles() {
  console.log("🌱 Seeding Roles...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
      },
      create: role,
    });
  }
}

async function seedPermissions() {
  console.log("🌱 Seeding Permissions...");

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }
}

async function seedRolePermissions() {
  console.log("🌱 Assigning Permissions to Roles...");

  for (const roleName of Object.keys(rolePermissions)) {
    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (!role) continue;

    for (const permissionName of rolePermissions[roleName]) {
      const permission = await prisma.permission.findUnique({
        where: {
          name: permissionName,
        },
      });

      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
}

async function seedSuperAdmin() {
  console.log("🌱 Creating Super Admin...");

  const password = await bcrypt.hash("ChangeMe123!", SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: {
      email: "admin@eacrms.local",
    },
    update: {},
    create: {
      email: "admin@eacrms.local",
      password,
      firstName: "System",
      lastName: "Administrator",
      phoneNumber: "0900000000",
      status: UserStatus.ACTIVE,
    },
  });

  const role = await prisma.role.findUnique({
    where: {
      name: "SUPER_ADMIN",
    },
  });

  if (!role) return;

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
    },
  });
}

async function main() {
  console.log("🚀 Starting Database Seed...");

  await seedRoles();

  await seedPermissions();

  await seedRolePermissions();

  await seedSuperAdmin();

  console.log("✅ Database Seed Completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
