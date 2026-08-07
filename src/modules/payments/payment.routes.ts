import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { paymentController } from "./payment.controller";
import { createEventRegistrationSchema, mockPaymentWebhookSchema } from "./payment.validation";

const router = Router();

router.post("/mock/webhook", validate(mockPaymentWebhookSchema), paymentController.mockWebhook);
router.get("/history", authenticate, paymentController.history);
router.get("/:paymentId/status", authenticate, paymentController.status);

export const eventPaymentRoutes = Router();
eventPaymentRoutes.post("/:eventId/registrations", authenticate, authorize("event:register"), validate(createEventRegistrationSchema), paymentController.createEventRegistration);

export default router;
