import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { publicLimiter, writeLimiter } from "../../middleware/rateLimit.middleware";
import { contactController } from "./contact.controller";
import { contactSubmissionSchema, updateContactStatusSchema } from "./contact.validation";

const router = Router();

/**
 * @swagger
 * /contact:
 *   post:
 *     tags: [Contact]
 *     summary: Submit a public contact message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name: { type: string, example: Abebe Bekele }
 *               email: { type: string, format: email, example: abebe@example.com }
 *               phone: { type: string, nullable: true, example: "+251911234567" }
 *               subject: { type: string, enum: [GENERAL_INQUIRY, ATHLETE_REGISTRATION, CLUB_REGISTRATION, EVENT_INQUIRY, PAYMENT_ISSUE, TECHNICAL_SUPPORT, MEDIA_INQUIRY, PARTNERSHIP, COMPLAINT, FEEDBACK] }
 *               message: { type: string, minLength: 10, example: I need help with my registration. }
 *               relatedTo: { type: string, enum: [ATHLETE, CLUB, EVENT, USER, GENERAL] }
 *               relatedId: { type: string, nullable: true, example: evt_123 }
 *     responses:
 *       201: { description: Contact message received }
 *       400: { description: Invalid request }
 */
router.post("/", publicLimiter, writeLimiter, validate(contactSubmissionSchema), contactController.submit);

/**
 * @swagger
 * /contact/status/{referenceNumber}:
 *   get:
 *     tags: [Contact]
 *     summary: Check contact message status
 *     parameters:
 *       - in: path
 *         name: referenceNumber
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Contact status returned }
 *       404: { description: Contact message not found }
 */
router.get("/status/:referenceNumber", publicLimiter, contactController.getStatus);

/**
 * @swagger
 * /contact/admin:
 *   get:
 *     tags: [Contact]
 *     summary: List contact messages
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [PENDING, IN_REVIEW, RESPONDED, RESOLVED, CLOSED] } }
 *       - { in: query, name: subject, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *     responses:
 *       200: { description: Contact messages returned }
 *       401: { description: Authentication required }
 *       403: { description: Contact permission required }
 */
router.get("/admin", authenticate, authorize("contact:view"), contactController.listAdmin);

/**
 * @swagger
 * /contact/admin/{id}:
 *   get:
 *     tags: [Contact]
 *     summary: Get a contact message
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Contact message returned }
 *       404: { description: Contact message not found }
 */
router.get("/admin/:id", authenticate, authorize("contact:view"), contactController.getAdminById);

/**
 * @swagger
 * /contact/admin/{id}:
 *   patch:
 *     tags: [Contact]
 *     summary: Update a contact message
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [PENDING, IN_REVIEW, RESPONDED, RESOLVED, CLOSED] }
 *               adminNotes: { type: string, nullable: true }
 *               respond: { type: boolean }
 *     responses:
 *       200: { description: Contact message updated }
 *       404: { description: Contact message not found }
 */
router.patch("/admin/:id", authenticate, authorize("contact:update"), validate(updateContactStatusSchema), contactController.updateAdmin);

/**
 * @swagger
 * /contact/admin/{id}:
 *   delete:
 *     tags: [Contact]
 *     summary: Delete a contact message
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Contact message deleted }
 *       404: { description: Contact message not found }
 */
router.delete("/admin/:id", authenticate, authorize("contact:delete"), contactController.deleteAdmin);

export default router;
