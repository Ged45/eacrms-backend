import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { resultController } from "./result.controller";

const router = Router();

// ─── Tab 0: Live Results (PUBLIC) ─────────────────────────────────────────
router.get("/live", resultController.getLiveEvents);
router.get("/live-event/:eventId", resultController.getLiveEventById);
router.get("/live/:eventId/competition/:compId", resultController.getLiveCompetition);
router.get("/live/:eventId", resultController.getLiveScoreboard);

// ─── Tab 1: Completed Results (PUBLIC) ────────────────────────────────────
router.get("/published", resultController.getPublishedResults);
router.get("/notable", resultController.getNotableResults);
router.get("/my-results", authenticate, authorize("athlete:view"), resultController.getMyResults);
router.get("/my-club", authenticate, authorize("club:view"), resultController.getMyClubResults);
router.get("/:id", resultController.getResultById);

export default router;
