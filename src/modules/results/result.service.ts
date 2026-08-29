import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import { resultRepository } from "./result.repository";

export class ResultService {
  async getByEvent(eventId: string) {
    const result = await resultRepository.findByEventId(eventId);
    if (!result) {
      throw new NotFoundError("Result not found for this event.");
    }
    return result;
  }

  async updateLiveScore(eventId: string, payload: {
    status?: "SCHEDULED" | "LIVE" | "FINAL";
    homeScore?: number;
    awayScore?: number;
    notes?: string;
    updatedByRole?: string;
    updatedById: string;
  }) {
    const result = await resultRepository.ensureResult(eventId);

    const nextStatus = payload.status ?? result.status;
    const nextHomeScore = payload.homeScore ?? result.homeScore;
    const nextAwayScore = payload.awayScore ?? result.awayScore;

    const versionStatus: "SCHEDULED" | "LIVE" | "FINAL" =
      nextStatus === "CERTIFIED" || nextStatus === "FINAL"
        ? "FINAL"
        : nextStatus === "LIVE"
          ? "LIVE"
          : "SCHEDULED";

    const updated = await resultRepository.updateResult(eventId, {
      status: nextStatus,
      homeScore: nextHomeScore,
      awayScore: nextAwayScore,
      notes: payload.notes ?? result.notes,
    });

    await resultRepository.createVersion(result.id, {
      eventResult: { connect: { id: result.id } },
      status: versionStatus,
      homeScore: nextHomeScore,
      awayScore: nextAwayScore,
      notes: payload.notes ?? result.notes,
      updatedByRole: payload.updatedByRole ?? "REFEREE",
      updatedBy: { connect: { id: payload.updatedById } },
    });

    return updated;
  }

  async addIncident(eventId: string, payload: {
    type: "SCORE_CHANGE" | "PENALTY" | "WARNING" | "DISQUALIFICATION" | "INJURY" | "OTHER";
    description: string;
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    relatedPlayer?: string;
    relatedTeam?: string;
    createdById: string;
  }) {
    const result = await resultRepository.ensureResult(eventId);
    const incident = await resultRepository.createIncident(result.id, {
      eventResult: { connect: { id: result.id } },
      type: payload.type,
      description: payload.description,
      severity: payload.severity ?? "MEDIUM",
      relatedPlayer: payload.relatedPlayer,
      relatedTeam: payload.relatedTeam,
      createdBy: { connect: { id: payload.createdById } },
    });

    return incident;
  }

  async certify(eventId: string, payload: { certified: boolean; notes?: string; certifiedById: string }) {
    const result = await resultRepository.findByEventId(eventId);
    if (!result) throw new NotFoundError("Result not found for this event.");

    if (!payload.certified) {
      throw new BadRequestError("Certification must be set to true.");
    }

    const updated = await resultRepository.updateResult(eventId, {
      status: "CERTIFIED",
      notes: payload.notes ?? result.notes,
      certifiedBy: { connect: { id: payload.certifiedById } },
      certifiedAt: new Date(),
    });

    return updated;
  }
}

export const resultService = new ResultService();
