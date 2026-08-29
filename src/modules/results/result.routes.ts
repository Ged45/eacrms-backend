import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { resultController } from "./result.controller";
import { certifyResultSchema, createIncidentSchema, createResultVersionSchema } from "./result.validation";

const router = Router({ mergeParams: true });

router.get("/:eventId/results", resultController.getByEvent);
router.post("/:eventId/results/update", authenticate, authorize("result:update"), validate(createResultVersionSchema), resultController.updateLiveScore);
router.post("/:eventId/results/incidents", authenticate, authorize("result:update"), validate(createIncidentSchema), resultController.addIncident);
router.post("/:eventId/results/certify", authenticate, authorize("result:certify"), validate(certifyResultSchema), resultController.certify);

export default router;
