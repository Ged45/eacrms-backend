import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { resultController } from "./result.controller";
import { certifyResultSchema, createIncidentSchema, createResultVersionSchema } from "./result.validation";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /events/{eventId}/results:
 *   get:
 *     tags: [Results]
 *     summary: Get event results and timeline
 *     parameters:
 *       - { in: path, name: eventId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Event result returned }
 *       404: { description: Result not found }
 */
router.get("/:eventId/results", resultController.getByEvent);

/**
 * @swagger
 * /events/{eventId}/results/incidents:
 *   get:
 *     tags: [Results]
 *     summary: Get the event incident timeline
 *     parameters:
 *       - { in: path, name: eventId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Incident timeline returned in chronological order }
 *       404: { description: Result not found }
 */
router.get("/:eventId/results/incidents", resultController.getIncidentsByEvent);

/**
 * @swagger
 * /events/{eventId}/results/update:
 *   post:
 *     tags: [Results]
 *     summary: Update a live event score
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: eventId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [SCHEDULED, LIVE, FINAL] }
 *               homeScore: { type: integer, minimum: 0 }
 *               awayScore: { type: integer, minimum: 0 }
 *               notes: { type: string }
 *               updatedByRole: { type: string }
 *     responses:
 *       200: { description: Live score updated }
 */
router.post("/:eventId/results/update", authenticate, authorize("result:update"), validate(createResultVersionSchema), resultController.updateLiveScore);

/**
 * @swagger
 * /events/{eventId}/results/incidents:
 *   post:
 *     tags: [Results]
 *     summary: Record an event incident
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: eventId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, description]
 *             properties:
 *               type: { type: string, enum: [SCORE_CHANGE, PENALTY, WARNING, DISQUALIFICATION, INJURY, OTHER] }
 *               description: { type: string }
 *               severity: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               relatedPlayer: { type: string }
 *               relatedTeam: { type: string }
 *     responses:
 *       201: { description: Incident recorded }
 */
router.post("/:eventId/results/incidents", authenticate, authorize("result:update"), validate(createIncidentSchema), resultController.addIncident);

/**
 * @swagger
 * /events/{eventId}/results/certify:
 *   post:
 *     tags: [Results]
 *     summary: Certify the official event result
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: eventId, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               certified: { type: boolean, default: true }
 *               notes: { type: string }
 *     responses:
 *       200: { description: Result certified }
 */
router.post("/:eventId/results/certify", authenticate, authorize("result:certify"), validate(certifyResultSchema), resultController.certify);

export default router;
