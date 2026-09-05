import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { applicationController } from "./application.controller";
import { reviewApplicationSchema } from "./application.validation";

const router = Router();

router.get("/", authenticate, authorize("events:applications"), applicationController.findAll);
router.patch("/:id", authenticate, authorize("events:manage"), validate(reviewApplicationSchema), applicationController.review);

export default router;
