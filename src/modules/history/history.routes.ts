import { Router } from "express";
import { historyController } from "./history.controller";

const router = Router();

router.get("/national-records", historyController.getNationalRecords);
router.get("/past-seasons", historyController.getPastSeasons);

export default router;
