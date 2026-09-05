import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { competitionResultController } from "./competition-result.controller";
import { createCompetitionResultSchema } from "./competition-result.validation";

const router = Router();

router.post("/:eventId/results", authenticate, authorize("events:manage"), validate(createCompetitionResultSchema), competitionResultController.create);
router.patch("/:eventId/results/publish", authenticate, authorize("event:approve"), competitionResultController.publish);

export default router;
