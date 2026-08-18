import { Router } from "express";
import { newsController } from "./news.controller";
import { validate } from "../../middleware/validate.middleware";
import { createNewsSchema, updateNewsSchema } from "./news.validation";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { publicLimiter, writeLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

// ─── Public Routes (no auth required) ────────────────────────────────────

router.get("/", publicLimiter, newsController.list);
router.get("/:id", publicLimiter, newsController.getById);

// ─── Admin Routes (auth + permission required) ───────────────────────────

router.get(
  "/admin",
  authenticate,
  authorize("news:view"),
  newsController.listAdmin
);

router.post(
  "/admin",
  authenticate,
  authorize("news:create"),
  validate(createNewsSchema),
  newsController.create
);

router.patch(
  "/admin/:id",
  authenticate,
  authorize("news:update"),
  validate(updateNewsSchema),
  newsController.update
);

router.delete(
  "/admin/:id",
  authenticate,
  authorize("news:delete"),
  newsController.remove
);

export default router;
