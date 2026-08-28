import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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

  // News
  { name: "news:create", description: "Create news articles" },
  { name: "news:view", description: "View news articles" },
  { name: "news:update", description: "Update news articles" },
  { name: "news:delete", description: "Delete news articles" },
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
    "news:create",
    "news:view",
    "news:update",
    "news:delete",
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

async function seedNews() {
  console.log("🌱 Seeding News Articles...");

  const articles = [
    {
      title: "National Championship 2026 Registration Deadline Extended",
      shortDescription:
        "The Ethiopian Athletics Federation has extended the official registration deadline for the 2026 National Championship to August 30th.",
      content:
        "The Ethiopian Athletics Federation (EAF) has officially announced the extension of the registration deadline for the 2026 National Championship.\n\nOriginally set for August 15th, the new deadline of August 30th gives athletes and clubs additional time to complete their registrations. The Federation cited logistical considerations and the desire to maximize participation as the primary reasons for the extension.\n\n\"We want to ensure that every qualified athlete has the opportunity to compete at the highest level,\" said EAF President Haile Gebrselassie. \"This extension reflects our commitment to inclusivity in Ethiopian athletics.\"\n\nClubs are encouraged to finalize their athlete registrations through the EACRMS platform before the new deadline. All registrations must include verified Fayda ID information.",
      category: "CHAMPIONSHIP",
      imageUrl:
        "https://images.unsplash.com/photo-1461896836934-bd45ba732f6f?w=800",
      author: "EAF Communications Department",
      isFeatured: true,
      publishedAt: new Date("2026-08-05T00:00:00Z"),
    },
    {
      title: "Ethiopian Athletes Shine at World Athletics Continental Tour",
      shortDescription:
        "A delegation of Ethiopian athletes delivered outstanding performances at the latest World Athletics Continental Tour Gold event.",
      content:
        "Ethiopian athletes continued their dominant form on the global stage with a series of impressive performances at the World Athletics Continental Tour Gold event held in Eugene, Oregon.\n\nThe highlight of the competition came in the men's 5000m, where a young Ethiopian runner clocked a stunning 12:52.31, securing both the victory and a new national under-20 record.\n\nIn the women's 1500m, another Ethiopian representative demonstrated tactical excellence, sitting behind the pace before unleashing a devastating final 400m to claim the silver medal with a personal best of 3:56.78.\n\nThese results underscore Ethiopia's continued excellence in middle and long-distance running and bode well for upcoming major championships.",
      category: "RECOGNITION",
      imageUrl:
        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
      author: "EAF Communications Department",
      isFeatured: true,
      publishedAt: new Date("2026-08-01T00:00:00Z"),
    },
    {
      title: "New Training Camp Facility Opens in Sendafa",
      shortDescription:
        "The Federation inaugurates a state-of-the-art training camp facility near Sendafa to support elite athlete development.",
      content:
        "The Ethiopian Athletics Federation has officially opened a new high-performance training camp facility in Sendafa, located approximately 50 kilometers north of Addis Ababa.\n\nThe facility features modern amenities including altitude training rooms, a fully equipped gymnasium, physiotherapy clinics, and multiple running tracks at various distances.\n\nThis investment is part of the Federation's long-term strategy to provide world-class training infrastructure for Ethiopian athletes, reducing the need for overseas training camps and keeping athletes closer to their support networks.",
      category: "ANNOUNCEMENT",
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      author: "EAF Communications Department",
      isFeatured: false,
      publishedAt: new Date("2026-07-25T00:00:00Z"),
    },
    {
      title: "Youth Athletics Development Program Reaches 10,000 Participants",
      shortDescription:
        "The Federation's grassroots youth program has surpassed 10,000 registered young athletes across all regions.",
      content:
        "The Ethiopian Athletics Federation's Youth Athletics Development Program has reached a major milestone, surpassing 10,000 registered participants across all regional states.\n\nThe program, launched eighteen months ago, targets athletes aged 8-18 and provides structured training, competition opportunities, and educational support.\n\nThis growth demonstrates the enormous appetite for athletics among Ethiopian youth and the effectiveness of the Federation's grassroots development strategy. The program has already identified several promising talents who have gone on to compete at national junior championships.",
      category: "COMMUNITY",
      imageUrl:
        "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800",
      author: "EAF Communications Department",
      isFeatured: false,
      publishedAt: new Date("2026-07-18T00:00:00Z"),
    },
    {
      title: "Updated Anti-Doping Education Program for 2026 Season",
      shortDescription:
        "Mandatory anti-doping education sessions will be conducted for all registered athletes and coaches before the upcoming season.",
      content:
        "In alignment with World Athletics and WADA requirements, the Ethiopian Athletics Federation has announced a comprehensive anti-doping education program for the 2026 season.\n\nAll registered athletes and coaches will be required to complete mandatory education sessions covering topics including: the prohibited substances list, Therapeutic Use Exemptions (TUEs), the testing process, and athletes' rights and responsibilities.\n\nSessions will be conducted both in-person at regional centers and online through the EACRMS platform. Athletes who do not complete the required education will not be eligible for competition registration.",
      category: "TRAINING",
      imageUrl:
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
      author: "EAF Communications Department",
      isFeatured: false,
      publishedAt: new Date("2026-07-10T00:00:00Z"),
    },
    {
      title: "EACRMS Platform Maintenance Window Scheduled",
      shortDescription:
        "The EACRMS platform will undergo scheduled maintenance to improve performance and add new features.",
      content:
        "The EACRMS technical team has scheduled a maintenance window for the platform on August 20th, 2026 from 02:00 to 06:00 EAT.\n\nDuring this time, the platform may experience brief periods of downtime or reduced performance. The maintenance will include database optimization, security updates, and the deployment of new athlete dashboard features.\n\nUsers are advised to complete any pending registrations or submissions before the maintenance window begins.",
      category: "GENERAL",
      imageUrl: null,
      author: "EACRMS Technical Team",
      isFeatured: false,
      publishedAt: new Date("2026-07-05T00:00:00Z"),
    },
  ];

  for (const article of articles) {
    const existing = await prisma.news.findFirst({
      where: { title: article.title },
    });

    if (!existing) {
      await prisma.news.create({ data: article });
    }
  }

  console.log(`   Inserted ${articles.length} news articles`);
}

async function main() {
  console.log("🚀 Starting Database Seed...");

  await seedRoles();

  await seedPermissions();

  await seedRolePermissions();

  await seedSuperAdmin();

  await seedNews();

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
