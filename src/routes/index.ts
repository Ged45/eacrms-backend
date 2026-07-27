import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import athleteRoutes from "../modules/athletes/athlete.route";
import healthRoutes from "../modules/health/health.routes";

const router = Router();

router.use("/health", healthRoutes);

router.use("/auth", authRoutes);

router.use("/athletes", athleteRoutes);

export default router;