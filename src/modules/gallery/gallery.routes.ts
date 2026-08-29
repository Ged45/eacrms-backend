import { Router } from "express";
import { galleryController } from "./gallery.controller";
import { publicLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

// Public routes — no authentication required
router.get("/", publicLimiter, galleryController.list);
router.get("/:id", publicLimiter, galleryController.getById);

export default router;
