import { PrismaClient, ResultCategory, ResultGender, LiveStatusType } from "@prisma/client";
import { NotFoundError } from "../../errors/NotFoundError";

const prisma = new PrismaClient();

// ─── Live Results (Tab 0) ──────────────────────────────────────────────────

/** Endpoint 1.1: Active Live Events List */
async function getLiveEvents() {
  const events = await prisma.liveEvent.findMany({
    include: {
      competitions: {
        include: { leaderboard: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { date: "desc" },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    venue: e.venue,
    date: e.date.toISOString().split("T")[0],
    overallStatusLabel: e.overallStatusLabel,
    overallStatusType: e.overallStatusType.toLowerCase(),
    competitionCount: e.competitionCount,
  }));
}

/** Endpoint 1.2: Single Live Event Details Container */
async function getLiveEventById(eventId: string) {
  const event = await prisma.liveEvent.findUnique({
    where: { id: eventId },
    include: {
      competitions: {
        include: { leaderboard: { orderBy: { sortOrder: "asc" }, take: 3 } },
      },
    },
  });

  if (!event) throw new NotFoundError("Live event not found.", { code: "LIVE_EVENT_NOT_FOUND", entity: "LiveEvent" });

  return {
    id: event.id,
    title: event.title,
    venue: event.venue,
    date: event.date.toISOString().split("T")[0],
    overallStatusLabel: event.overallStatusLabel,
    overallStatusType: event.overallStatusType.toLowerCase(),
    competitions: event.competitions.map((c) => ({
      id: c.id,
      discipline: c.discipline,
      gender: c.gender,
      category: c.category,
      statusLabel: c.statusLabel,
      statusType: c.statusType.toLowerCase(),
      elapsedTime: c.elapsedTime,
      progressLabel: c.progressLabel,
      top3Preview: c.leaderboard.map((l) => ({
        pos: l.pos,
        name: l.name,
        bib: l.bib,
        club: l.club,
        time: l.time,
        diff: l.diff,
      })),
    })),
  };
}

/** Endpoint 1.3: Isolated Live Competition Leaderboard */
async function getLiveCompetition(eventId: string, compId: string) {
  const competition = await prisma.liveCompetition.findFirst({
    where: { id: compId, liveEventId: eventId },
    include: { leaderboard: { orderBy: { sortOrder: "asc" } }, liveEvent: true },
  });

  if (!competition) throw new NotFoundError("Live competition not found.", { code: "LIVE_COMP_NOT_FOUND", entity: "LiveCompetition" });

  return {
    eventId: competition.liveEventId,
    competitionId: competition.id,
    discipline: competition.discipline,
    eventTitle: competition.liveEvent.title,
    statusLabel: competition.statusLabel,
    statusType: competition.statusType.toLowerCase(),
    elapsedTime: competition.elapsedTime,
    progressLabel: competition.progressLabel,
    leaderboard: competition.leaderboard.map((l) => ({
      pos: l.pos,
      name: l.name,
      bib: l.bib,
      club: l.club,
      time: l.time,
      diff: l.diff,
    })),
  };
}

// ─── Completed Results (Tab 1) ─────────────────────────────────────────────

interface PublishedQuery {
  category?: string;
  search?: string;
  gender?: string;
  page?: number;
  limit?: number;
}

/** Endpoint 2.1: Published Completed Results List */
async function getPublishedResults(query: PublishedQuery) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { isLive: false };
  if (query.category) where.category = query.category.toUpperCase();
  if (query.gender) where.gender = query.gender.toUpperCase();
  if (query.search) {
    where.OR = [
      { eventTitle: { contains: query.search, mode: "insensitive" } },
      { discipline: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [results, total] = await Promise.all([
    prisma.result.findMany({
      where,
      include: { allFinishers: { orderBy: { sortOrder: "asc" }, take: 3 } },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.result.count({ where }),
  ]);

  return {
    data: results.map((r) => ({
      id: r.id,
      eventTitle: r.eventTitle,
      discipline: r.discipline,
      date: r.date.toISOString().split("T")[0],
      venue: r.venue,
      category: r.category,
      gender: r.gender,
      isLive: r.isLive,
      statusLabel: r.statusLabel,
      statusType: r.statusType.toLowerCase(),
      top3Preview: r.allFinishers.map((f) => ({
        rank: f.rank,
        name: f.name,
        club: f.club,
        performance: f.performance,
      })),
      totalFinishers: r.totalFinishers,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/** Endpoint 2.2: Single Completed Result Details */
async function getResultById(id: string, userId?: string) {
  const result = await prisma.result.findUnique({
    where: { id },
    include: { allFinishers: { orderBy: { sortOrder: "asc" } }, teamRankings: { orderBy: { sortOrder: "asc" } } },
  });

  if (!result) throw new NotFoundError("Result not found.", { code: "RESULT_NOT_FOUND", entity: "Result" });

  // Build personalized highlight if user is authenticated
  let userPerformanceHighlight: any = { isMatchFound: false };

  if (userId) {
    const athlete = await prisma.athlete.findUnique({ where: { userId } });
    if (athlete) {
      const matchedFinishers = result.allFinishers.filter((f) => f.athleteId === athlete.id);
      if (matchedFinishers.length > 0) {
        const bestRank = matchedFinishers.reduce((best, f) => {
          const rankNum = parseInt(f.rank);
          return !isNaN(rankNum) && rankNum < best ? rankNum : best;
        }, Infinity);

        const headlines: Record<number, string> = { 1: "1st Place — Gold Medalist", 2: "2nd Place — Silver Medalist", 3: "3rd Place — Bronze Medalist" };
        userPerformanceHighlight = {
          isMatchFound: true,
          userRole: "athlete",
          headline: headlines[bestRank] || `Finished ${bestRank}th`,
          matchedFinishers: matchedFinishers.map((f) => ({ rank: f.rank, name: f.name, performance: f.performance, notes: f.notes })),
        };
      }
    }

    const club = await prisma.club.findUnique({ where: { adminId: userId } });
    if (club) {
      const matchedFinishers = result.allFinishers.filter((f) => f.club === club.name);
      if (matchedFinishers.length > 0) {
        userPerformanceHighlight = {
          isMatchFound: true,
          userRole: "clubAdmin",
          headline: `${club.name} Placements`,
          matchedFinishers: matchedFinishers.map((f) => ({ rank: f.rank, name: f.name, performance: f.performance, notes: f.notes })),
        };
      }
    }
  }

  return {
    id: result.id,
    eventTitle: result.eventTitle,
    discipline: result.discipline,
    date: result.date.toISOString().split("T")[0],
    venue: result.venue,
    category: result.category,
    gender: result.gender,
    isLive: result.isLive,
    statusLabel: result.statusLabel,
    statusType: result.statusType.toLowerCase(),
    userPerformanceHighlight,
    allFinishers: result.allFinishers.map((f) => ({
      rank: f.rank,
      name: f.name,
      performance: f.performance,
      club: f.club,
      nationality: f.nationality,
      notes: f.notes,
    })),
    teamRankings: result.teamRankings.map((t) => ({
      rank: t.rank,
      clubName: t.clubName,
      score: t.score,
      notes: t.notes,
    })),
  };
}

// ─── Role-Scoped (Tab 2) ──────────────────────────────────────────────────

/** Endpoint 3.1: Athlete Personal Results */
async function getMyResults(userId: string) {
  const athlete = await prisma.athlete.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!athlete) throw new NotFoundError("Athlete profile not found.", { code: "ATHLETE_NOT_FOUND", entity: "Athlete" });

  const finishers = await prisma.resultFinisher.findMany({
    where: { athleteId: athlete.id },
    include: { result: true },
    orderBy: { result: { date: "desc" } },
  });

  return {
    athleteName: `${athlete.user.firstName} ${athlete.user.lastName}`,
    fanNumber: athlete.user.phoneNumber || "",
    totalResultsCount: finishers.length,
    data: finishers.map((f) => ({
      resultId: f.resultId,
      eventTitle: f.result.eventTitle,
      discipline: f.result.discipline,
      date: f.result.date.toISOString().split("T")[0],
      venue: f.result.venue,
      rank: f.rank,
      performance: f.performance,
      club: f.club,
      notes: f.notes,
    })),
  };
}

/** Endpoint 3.2: Club Admin Results */
async function getMyClubResults(userId: string) {
  const club = await prisma.club.findUnique({ where: { adminId: userId } });

  if (!club) throw new NotFoundError("Club not found for this admin.", { code: "CLUB_NOT_FOUND", entity: "Club" });

  // Team rankings where club name matches
  const teamRankings = await prisma.teamRanking.findMany({
    where: { clubName: club.name },
    include: { result: true },
    orderBy: { result: { date: "desc" } },
  });

  // Athlete results from this club
  const athleteResults = await prisma.resultFinisher.findMany({
    where: { club: club.name },
    include: { result: true },
    orderBy: { result: { date: "desc" } },
  });

  return {
    clubName: club.name,
    totalClubResultsCount: teamRankings.length + athleteResults.length,
    teamStandings: teamRankings.map((t) => ({
      resultId: t.resultId,
      eventTitle: t.result.eventTitle,
      date: t.result.date.toISOString().split("T")[0],
      rank: t.rank,
      score: t.score,
      notes: t.notes,
    })),
    athleteResults: athleteResults.map((f) => ({
      resultId: f.resultId,
      eventTitle: f.result.eventTitle,
      discipline: f.result.discipline,
      date: f.result.date.toISOString().split("T")[0],
      athleteName: f.name,
      rank: f.rank,
      performance: f.performance,
      notes: f.notes,
    })),
  };
}

/** Endpoint 3.3: Notable Results (podium finishes + records) */
async function getNotableResults() {
  const finishers = await prisma.resultFinisher.findMany({
    where: {
      OR: [
        { rank: "1" },
        { rank: "2" },
        { rank: "3" },
        { notes: { in: ["NR", "WR"] } },
      ],
    },
    include: { result: true },
    orderBy: { result: { date: "desc" } },
  });

  return {
    totalNotableCount: finishers.length,
    data: finishers.map((f) => ({
      resultId: f.resultId,
      eventTitle: f.result.eventTitle,
      discipline: f.result.discipline,
      date: f.result.date.toISOString().split("T")[0],
      venue: f.result.venue,
      athleteName: f.name,
      club: f.club,
      rank: f.rank,
      performance: f.performance,
      notes: f.notes,
    })),
  };
}

// ─── Direct single-race live scoreboard (deep link) ────────────────────────

async function getLiveScoreboard(eventId: string) {
  const event = await prisma.liveEvent.findUnique({
    where: { id: eventId },
    include: {
      competitions: {
        include: { leaderboard: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  if (!event) throw new NotFoundError("Live event not found.", { code: "LIVE_EVENT_NOT_FOUND", entity: "LiveEvent" });

  // If single competition, return its leaderboard directly
  if (event.competitions.length === 1) {
    const comp = event.competitions[0];
    return {
      eventId: event.id,
      competitionId: comp.id,
      discipline: comp.discipline,
      eventTitle: event.title,
      statusLabel: comp.statusLabel,
      statusType: comp.statusType.toLowerCase(),
      elapsedTime: comp.elapsedTime,
      progressLabel: comp.progressLabel,
      leaderboard: comp.leaderboard.map((l) => ({
        pos: l.pos,
        name: l.name,
        bib: l.bib,
        club: l.club,
        time: l.time,
        diff: l.diff,
      })),
    };
  }

  // Multiple competitions: return event-level summary
  return {
    id: event.id,
    title: event.title,
    venue: event.venue,
    date: event.date.toISOString().split("T")[0],
    overallStatusLabel: event.overallStatusLabel,
    overallStatusType: event.overallStatusType.toLowerCase(),
    competitionCount: event.competitionCount,
    competitions: event.competitions.map((c) => ({
      id: c.id,
      discipline: c.discipline,
      gender: c.gender,
      category: c.category,
      statusLabel: c.statusLabel,
      statusType: c.statusType.toLowerCase(),
      elapsedTime: c.elapsedTime,
      progressLabel: c.progressLabel,
      top3Preview: c.leaderboard.slice(0, 3).map((l) => ({
        pos: l.pos,
        name: l.name,
        bib: l.bib,
        club: l.club,
        time: l.time,
        diff: l.diff,
      })),
    })),
  };
}

export const resultService = {
  getLiveEvents,
  getLiveEventById,
  getLiveCompetition,
  getPublishedResults,
  getResultById,
  getMyResults,
  getMyClubResults,
  getNotableResults,
  getLiveScoreboard,
};
