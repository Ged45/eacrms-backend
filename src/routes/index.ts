import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import athleteRoutes from "../modules/athletes/athlete.route";
import healthRoutes from "../modules/health/health.routes";
import clubRoutes from "../modules/clubs/club.routes";
import coachRoutes from "../modules/coaches/coach.routes";
import faydaRoutes from "../modules/fayda/fayda.routes";

const router = Router();

router.use("/health", healthRoutes);

router.use("/auth", authRoutes);

router.use("/athletes", athleteRoutes);

router.use("/clubs", clubRoutes);

router.use("/coaches", coachRoutes);

router.use("/", faydaRoutes);

export default router;