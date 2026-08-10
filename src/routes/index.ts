import { Router } from "express";

// Module Route Imports
import healthRoutes from "../modules/health/health.routes";
import verificationRoutes from "../modules/verification/verification.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import athleteRoutes from "../modules/athletes/athlete.route";
import clubRoutes from "../modules/clubs/club.routes";
import coachRoutes from "../modules/coaches/coach.routes";
import policyRoutes from "../modules/policies/policies.routes";
import paymentRoutes, { eventPaymentRoutes } from "../modules/payments/payment.routes";
import eventRoutes from "../modules/events/event.routes";
import faydaRoutes from "../modules/fayda/fayda.routes";

const router = Router();

// 1. Health & Status
router.use("/health", healthRoutes);

// 2. Auth & Verification (Specific sub-routes registered before general /auth)
router.use("/auth/verify", verificationRoutes);
router.use("/auth", authRoutes);

// 3. User & Role Management
router.use("/users", userRoutes);
router.use("/athletes", athleteRoutes);
router.use("/clubs", clubRoutes);
router.use("/coaches", coachRoutes);

// 4. Federation Policies
router.use("/policies", policyRoutes);

// 5. Payments & Events (Specific event payment sub-routes registered before general event routes)
router.use("/payments", paymentRoutes);
router.use("/events", eventPaymentRoutes);
router.use("/events", eventRoutes);

// 6. External Identity / Integrations
router.use("/", faydaRoutes);

export default router;