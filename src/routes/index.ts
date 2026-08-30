import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import verificationRoutes from "../modules/verification/verification.routes";
import athleteRoutes from "../modules/athletes/athlete.route";
import athleteUploadRoutes from "../modules/athletes/athlete.upload.routes";
import healthRoutes from "../modules/health/health.routes";
import clubRoutes from "../modules/clubs/club.routes";
import coachRoutes from "../modules/coaches/coach.routes";
import faydaRoutes from "../modules/fayda/fayda.routes";
import userRoutes from "../modules/users/user.routes";
import eventRoutes from "../modules/events/event.routes";
import policyRoutes from "../modules/policies/policy.routes";
import paymentRoutes, { eventPaymentRoutes } from "../modules/payments/payment.routes";
import metaRoutes from "../modules/meta/meta.routes";
import newsRoutes from "../modules/news/news.routes";
import newsUploadRoutes from "../modules/news/news.upload.routes";
import contactRoutes from "../modules/contact/contact.routes";
import resultRoutes from "../modules/results/result.routes";
import galleryRoutes from "../modules/gallery/gallery.routes";

const router = Router();

router.use("/health", healthRoutes);

router.use("/auth", authRoutes);

router.use("/auth/verify", verificationRoutes);

router.use("/athletes", athleteRoutes);
router.use("/athletes/profile", athleteUploadRoutes);

router.use("/clubs", clubRoutes);

router.use("/coaches", coachRoutes);

router.use("/", faydaRoutes);

router.use("/users", userRoutes);

router.use("/events", eventRoutes);

router.use("/policies", policyRoutes);

router.use("/payments", paymentRoutes);
router.use("/events", eventPaymentRoutes);

router.use("/", metaRoutes);

router.use("/news", newsRoutes);
router.use("/news/upload", newsUploadRoutes);
router.use("/contact", contactRoutes);
router.use("/events", resultRoutes);

router.use("/gallery", galleryRoutes);
router.use("/media", galleryRoutes);

export default router;
