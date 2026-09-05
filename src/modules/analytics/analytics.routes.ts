import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { analyticsController } from "./analytics.controller";

const router = Router();

router.get("/dashboard", authenticate, authorize("analytics:view"), analyticsController.getDashboard);

export default router;
