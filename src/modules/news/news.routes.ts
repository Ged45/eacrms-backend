import { Router } from "express";
import { newsController } from "./news.controller";

const router = Router();

// ─── Public Routes (no auth required) ────────────────────────────────────

router.get("/", newsController.list);
router.get("/:id", newsController.getById);

export default router;
