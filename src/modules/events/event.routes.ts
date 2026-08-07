import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { eventController } from "./event.controller";
import { createEventSchema, overrideEventStatusSchema, statusReasonSchema } from "./event.validation";
import { enforcePolicies } from "../../middleware/policy-enforcement.middleware";
import { PolicyScope } from "@prisma/client";
import { eventCheckInController } from "./event-checkin.controller";
import { generateQrTokenSchema, scanQrTokenSchema } from "./event-checkin.validation";

const router = Router();

router.get("/published", eventController.findPublished);
router.get("/", authenticate, authorize("event:view"), eventController.findAll);
router.post("/", authenticate, authorize("event:create"), validate(createEventSchema), eventController.create);
router.post("/:eventId/qr-tokens", authenticate, authorize("event:checkin"), validate(generateQrTokenSchema), eventCheckInController.generateToken);
router.post("/:eventId/check-ins/scan", authenticate, authorize("event:checkin"), validate(scanQrTokenSchema), eventCheckInController.scan);
router.get("/:eventId/check-ins", authenticate, authorize("event:view"), eventCheckInController.list);
router.get("/:id", authenticate, authorize("event:view"), eventController.findById);
router.patch("/:id/submit", authenticate, authorize("event:create"), enforcePolicies(PolicyScope.EVENT, (req) => ({ eventId: req.params.id as string })), eventController.submit);
router.patch("/:id/approve", authenticate, authorize("event:approve"), eventController.approve);
router.patch("/:id/reject", authenticate, authorize("event:approve"), validate(statusReasonSchema), eventController.reject);
router.patch("/:id/status", authenticate, authorize("event:override"), validate(overrideEventStatusSchema), eventController.overrideStatus);

export default router;
