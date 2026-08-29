import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { publicLimiter, writeLimiter } from "../../middleware/rateLimit.middleware";
import { contactController } from "./contact.controller";
import { contactSubmissionSchema, updateContactStatusSchema } from "./contact.validation";

const router = Router();

router.post("/", publicLimiter, writeLimiter, validate(contactSubmissionSchema), contactController.submit);
router.get("/status/:referenceNumber", publicLimiter, contactController.getStatus);

router.get("/admin", authenticate, authorize("contact:view"), contactController.listAdmin);
router.get("/admin/:id", authenticate, authorize("contact:view"), contactController.getAdminById);
router.patch("/admin/:id", authenticate, authorize("contact:update"), validate(updateContactStatusSchema), contactController.updateAdmin);
router.delete("/admin/:id", authenticate, authorize("contact:delete"), contactController.deleteAdmin);

export default router;
