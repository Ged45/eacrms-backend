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

async function seedAthletes() {
  console.log("🌱 Seeding Athletes...");

  const password = await bcrypt.hash("AthletePass123!", SALT_ROUNDS);

  // Create sports first
  const sports = [
    { name: "Marathon", description: "Long-distance road running event (42.195 km)" },
    { name: "5000m", description: "Middle-distance track event" },
    { name: "10000m", description: "Long-distance track event" },
    { name: "1500m", description: "Middle-distance track event" },
    { name: "100m", description: "Sprint event" },
    { name: "800m", description: "Middle-distance track event" },
    { name: "3000m Steeplechase", description: "Obstacle race event" },
    { name: "Half Marathon", description: "Road running event (21.1 km)" },
  ];

  const createdSports: Record<string, string> = {};
  for (const sport of sports) {
    const existing = await prisma.sport.findUnique({ where: { name: sport.name } });
    if (existing) {
      createdSports[sport.name] = existing.id;
    } else {
      const created = await prisma.sport.create({ data: sport });
      createdSports[sport.name] = created.id;
    }
  }

  // Create a verified club
  const club = await prisma.club.upsert({
    where: { name: "Addis Ababa Runners Club" },
    update: {},
    create: {
      name: "Addis Ababa Runners Club",
      shortName: "AARC",
      email: "info@aarc.et",
      phone: "+251911000000",
      city: "Addis Ababa",
      region: "Addis Ababa",
      verificationStatus: "VERIFIED",
    },
  });

  // Create 6 Ethiopian athletes
  const athletes = [
    {
      email: "tigist.akele@example.com",
      firstName: "Tigist",
      lastName: "Akele",
      phoneNumber: "+251911100001",
      dateOfBirth: new Date("1998-03-15"),
      gender: "FEMALE" as const,
      nationality: "Ethiopian",
      sportName: "Marathon",
      region: "Addis Ababa",
      height: 165,
      weight: 52,
      primaryEvent: "Marathon",
      amharicName: "ትግስት አክሌ",
    },
    {
      email: "kelvin.kiptum@example.com",
      firstName: "Kelvin",
      lastName: "Kiptoo",
      phoneNumber: "+251911100002",
      dateOfBirth: new Date("2000-11-20"),
      gender: "MALE" as const,
      nationality: "Ethiopian",
      sportName: "5000m",
      region: "Oromia",
      height: 170,
      weight: 56,
      primaryEvent: "5000m",
      amharicName: "ཀልቫን ኪፕቱ",
    },
    {
      email: "letesenbet.gidey@example.com",
      firstName: "Letesenbet",
      lastName: "Gidey",
      phoneNumber: "+251911100003",
      dateOfBirth: new Date("1998-03-20"),
      gender: "FEMALE" as const,
      nationality: "Ethiopian",
      sportName: "10000m",
      region: "Tigray",
      height: 168,
      weight: 50,
      primaryEvent: "10000m",
      amharicName: "ለተሰንበት ግيدይ",
    },
    {
      email: "samuel.tefera@example.com",
      firstName: "Samuel",
      lastName: "Tefera",
      phoneNumber: "+251911100004",
      dateOfBirth: new Date("2000-05-23"),
      gender: "MALE" as const,
      nationality: "Ethiopian",
      sportName: "1500m",
      region: "Addis Ababa",
      height: 172,
      weight: 58,
      primaryEvent: "1500m",
      amharicName: "ሳሙኤል ተፈራ",
    },
    {
      email: "helen.obiri@example.com",
      firstName: "Helen",
      lastName: "Obiri",
      phoneNumber: "+251911100005",
      dateOfBirth: new Date("1988-09-13"),
      gender: "FEMALE" as const,
      nationality: "Ethiopian",
      sportName: "5000m",
      region: "Oromia",
      height: 160,
      weight: 48,
      primaryEvent: "5000m",
      amharicName: "ሄለን ኦቢሪ",
    },
    {
      email: "yumqi.jawo@example.com",
      firstName: "Yomif",
      lastName: "Kejelcha",
      phoneNumber: "+251911100006",
      dateOfBirth: new Date("1997-08-02"),
      gender: "MALE" as const,
      nationality: "Ethiopian",
      sportName: "10000m",
      region: "Oromia",
      height: 175,
      weight: 62,
      primaryEvent: "10000m",
      amharicName: "ዮሚፍ ከጀላ",
    },
  ];

  const athleteRole = await prisma.role.findUnique({ where: { name: "ATHLETE" } });
  if (!athleteRole) {
    console.log("   ⚠️  ATHLETE role not found, skipping athlete seeding");
    return;
  }

  let created = 0;
  for (const athlete of athletes) {
    // Skip if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: athlete.email } });
    if (existingUser) continue;

    await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: athlete.email,
          password,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          phoneNumber: athlete.phoneNumber,
          status: "ACTIVE",
          emailVerified: true,
          phoneVerified: true,
        },
      });

      // Assign ATHLETE role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: athleteRole.id,
        },
      });

      // Create athlete profile
      await tx.athlete.create({
        data: {
          userId: user.id,
          dateOfBirth: athlete.dateOfBirth,
          gender: athlete.gender,
          nationality: athlete.nationality,
          sportId: createdSports[athlete.sportName],
          clubId: club.id,
          region: athlete.region,
          height: athlete.height,
          weight: athlete.weight,
          primaryEvent: athlete.primaryEvent,
          amharicName: athlete.amharicName,
          status: "ACTIVE",
          faydaVerified: true,
          registrationSource: "SELF",
        },
      });
    });

    created++;
    console.log(`   ✅ Created athlete: ${athlete.firstName} ${athlete.lastName}`);
  }

  console.log(`   Inserted ${created} athletes`);
}

async function seedGallery() {
  console.log("🌱 Seeding Gallery...");

  const galleries = [
    {
      title: "24th African Athletics Championship Highlights",
      amharicTitle: "24ኛው የአፍሪካ አትሌቲክስ ሻምፒዮና ማብሪያዎች",
      category: "CHAMPIONSHIP",
      type: "PHOTO",
      coverImage: "https://images.unsplash.com/photo-1461896836934-bd45ba732f6f?w=1200",
      description: "Stunning moments from the 24th African Athletics Championship held at Addis Ababa Stadium. Ethiopian athletes dominated the distance events, securing multiple gold medals.",
      eventDate: new Date("2026-07-15T00:00:00Z"),
      location: "Addis Ababa National Stadium",
      photographer: "EAF Media Unit / Solomon Desta",
      capturesCount: 24,
      isFeatured: true,
      captures: [
        { title: "5000m Final Sprint", caption: "Ethiopian runner kicks in the final 200m to claim gold", url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400", sortOrder: 1 },
        { title: "Medal Ceremony", caption: "Gold medal presentation for the 10000m event", url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", sortOrder: 2 },
        { title: "Marathon Start", caption: "Mass start of the men's marathon event", url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400", sortOrder: 3 },
      ],
    },
    {
      title: "2026 Addis Ababa Marathon",
      amharicTitle: "2026 አዲስ አበባ ማራቶን",
      category: "MARATHON",
      type: "PHOTO",
      coverImage: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=1200",
      description: "Highlights from the annual Addis Ababa Marathon, featuring elite runners from across Ethiopia and international participants.",
      eventDate: new Date("2026-06-20T00:00:00Z"),
      location: "Addis Ababa City Center",
      photographer: "EAF Media Unit",
      capturesCount: 18,
      isFeatured: true,
      captures: [
        { title: "Lead Pack", caption: "Elite runners maintaining pace through kilometer 30", url: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=400", sortOrder: 1 },
        { title: "Finish Line", caption: "Winner crosses the finish line with arms raised", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400", sortOrder: 2 },
      ],
    },
    {
      title: "National Training Camp - Sendafa",
      amharicTitle: "የእንደፋ ብሔራዊ ስልጠና አካባቢ",
      category: "TRAINING",
      type: "VIDEO",
      coverImage: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200",
      description: "Behind-the-scenes footage from the national team training camp in Sendafa, showcasing altitude training sessions.",
      eventDate: new Date("2026-05-10T00:00:00Z"),
      location: "Sendafa Training Center",
      photographer: "EAF Media Unit / Abebe Bikila Jr.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoDuration: "12:45",
      capturesCount: 8,
      isFeatured: false,
      captures: [
        { title: "Morning Track Session", caption: "Athletes warming up on the track at dawn", url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400", sortOrder: 1 },
        { title: "Altitude Training", caption: "Team running on high-altitude trails", url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400", sortOrder: 2 },
      ],
    },
    {
      title: "Historic Moments: Ethiopian Athletics Legacy",
      amharicTitle: "ታሪካዊ ጊዜያት: የኢትዮጵያ አትሌቲክስ ቅርስ",
      category: "HISTORIC",
      type: "PHOTO",
      coverImage: "https://images.unsplash.com/photo-1461896836934-bd45ba732f6f?w=1200",
      description: "A collection of iconic moments from Ethiopia's rich athletics history, from Abebe Bikila's Olympic victories to modern-day champions.",
      eventDate: new Date("2026-01-01T00:00:00Z"),
      location: "Various Locations",
      photographer: "EAF Archives",
      capturesCount: 30,
      isFeatured: true,
      captures: [
        { title: "Abebe Bikila - Rome 1960", caption: "Barefoot victory in the Olympic marathon", url: "https://images.unsplash.com/photo-1461896836934-bd45ba732f6f?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1461896836934-bd45ba732f6f?w=400", sortOrder: 1, photographer: "IOC Archives" },
        { title: "Haile Gebrselassie - Berlin 2008", caption: "World record marathon in Berlin", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400", sortOrder: 2, photographer: "Getty Images" },
      ],
    },
    {
      title: "2026 National Road Race Series",
      amharicTitle: "2026 ብሔራዊ የመንገድ ሩጫ ተዝማሮ",
      category: "ROAD_RACE",
      type: "PHOTO",
      coverImage: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=1200",
      description: "Scenic shots from the national road race series across Ethiopia's beautiful landscapes.",
      eventDate: new Date("2026-04-05T00:00:00Z"),
      location: "Hawassa to Arba Minch",
      photographer: "EAF Media Unit",
      capturesCount: 42,
      isFeatured: false,
      captures: [
        { title: "Lakeside Running", caption: "Runners passing by Lake Hawassa", url: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=400", sortOrder: 1 },
      ],
    },
    {
      title: "Ethiopia vs Kenya - East African Challenge",
      amharicTitle: "ኢትዮጵያ በንRequestMethod ላለው ሩጫ",
      category: "CHAMPIONSHIP",
      type: "VIDEO",
      coverImage: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200",
      description: "Full video highlights from the East African Challenge track and field meet.",
      eventDate: new Date("2026-03-25T00:00:00Z"),
      location: "Addis Ababa National Stadium",
      photographer: "EAF Media Unit",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoDuration: "28:30",
      capturesCount: 12,
      isFeatured: false,
      captures: [
        { title: "1500m Battle", caption: "Intense battle for the lead in the 1500m final", url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200", thumbnailUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400", sortOrder: 1 },
      ],
    },
  ];

  let created = 0;
  for (const gallery of galleries) {
    const existing = await prisma.gallery.findFirst({ where: { title: gallery.title } });
    if (existing) continue;

    const { captures, ...galleryData } = gallery;

    await prisma.$transaction(async (tx) => {
      const createdGallery = await tx.gallery.create({
        data: galleryData,
      });

      if (captures && captures.length > 0) {
        await tx.galleryCapture.createMany({
          data: captures.map((capture) => ({
            galleryId: createdGallery.id,
            ...capture,
          })),
        });
      }
    });

    created++;
    console.log(`   ✅ Created gallery: ${gallery.title}`);
  }

  console.log(`   Inserted ${created} gallery albums`);
}

async function safeSeed(name: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (error) {
    console.error(`   ⚠️  ${name} failed:`, error instanceof Error ? error.message : error);
    // Continue with next seed
  }
}

async function main() {
  console.log("🚀 Starting Database Seed...");

  await safeSeed("Roles", seedRoles);
  await safeSeed("Permissions", seedPermissions);
  await safeSeed("Role Permissions", seedRolePermissions);
  await safeSeed("Super Admin", seedSuperAdmin);
  await safeSeed("News", seedNews);
  await safeSeed("Athletes", seedAthletes);
  await safeSeed("Gallery", seedGallery);

  console.log("✅ Database Seed Completed");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    // Don't exit with error - let server start
    console.log("⚠️  Continuing despite seed error...");
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
