import { PrismaClient, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const CLUB_ADMIN_EMAIL = "clubadmin@aarc.et";
const CLUB_ADMIN_PASSWORD = "ClubAdmin123!";

async function main() {
  console.log("🔑 Seeding Club Admin for Addis Ababa Runners Club...\n");

  // 1. Find the existing club
  const club = await prisma.club.findFirst({
    where: { email: "info@aarc.et" },
  });
  if (!club) {
    console.error(
      "❌ Club 'Addis Ababa Runners Club' not found. Run the main seed first."
    );
    process.exit(1);
  }
  console.log(`   Found club: ${club.name} (${club.id})`);

  // 2. Find CLUB_ADMIN role
  const clubAdminRole = await prisma.role.findUnique({
    where: { name: "CLUB_ADMIN" },
  });
  if (!clubAdminRole) {
    console.error(
      "❌ CLUB_ADMIN role not found. Run the main seed first."
    );
    process.exit(1);
  }
  console.log(`   Found role: ${clubAdminRole.name} (${clubAdminRole.id})`);

  // 3. Create or update the club admin user
  const hashedPassword = await bcrypt.hash(CLUB_ADMIN_PASSWORD, SALT_ROUNDS);

  let user = await prisma.user.findUnique({
    where: { email: CLUB_ADMIN_EMAIL },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    });
    console.log(`   ✅ Updated existing user: ${user.email}`);
  } else {
    user = await prisma.user.create({
      data: {
        email: CLUB_ADMIN_EMAIL,
        password: hashedPassword,
        firstName: "Dawit",
        lastName: "Bekele",
        phoneNumber: "+251911200001",
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
      },
    });
    console.log(`   ✅ Created user: ${user.email}`);
  }

  // 4. Assign CLUB_ADMIN role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: clubAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: clubAdminRole.id,
    },
  });
  console.log(`   ✅ Assigned CLUB_ADMIN role`);

  // 5. Link as admin of the club
  await prisma.club.update({
    where: { id: club.id },
    data: { adminId: user.id },
  });
  console.log(`   ✅ Linked as admin of ${club.name}`);

  // 6. Print credentials
  console.log(
    "\n" + "═".repeat(55)
  );
  console.log("  🏅  CLUB ADMIN CREDENTIALS");
  console.log("═".repeat(55));
  console.log(`  Email    : ${CLUB_ADMIN_EMAIL}`);
  console.log(`  Password : ${CLUB_ADMIN_PASSWORD}`);
  console.log(`  Club     : ${club.name}`);
  console.log(`  Status   : ACTIVE`);
  console.log(`  Verified : Yes`);
  console.log("═".repeat(55));
  console.log("\n  Permissions:");
  console.log("    • athlete:create   — Register athletes");
  console.log("    • athlete:update   — Update athletes");
  console.log("    • coach:create     — Register coaches");
  console.log("    • coach:update     — Update coaches");
  console.log("    • competition:view — View competitions");
  console.log("═".repeat(55) + "\n");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
