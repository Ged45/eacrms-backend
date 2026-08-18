import { Router } from "express";
import { createUploader, getUploadUrl } from "../../lib/uploads/multer.config";
import { authenticate } from "../../middleware/auth.middleware";
import { uploadLimiter } from "../../middleware/rateLimit.middleware";
import { athleteService } from "./athlete.service";

const router = Router();
const upload = createUploader("athletes", undefined, 5);

/**
 * POST /api/v1/athletes/profile/photo
 * Upload and set the authenticated athlete's profile photo.
 * Replaces the previous photo URL on the athlete record.
 */
router.post(
  "/photo",
  uploadLimiter,
  authenticate,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded." });
      return;
    }

    const url = getUploadUrl("athletes", req.file.filename);

    const result = await athleteService.updateProfile(req.user.userId, {
      photoUrl: url,
    });

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully.",
      data: {
        photoUrl: url,
        athleteId: result.id,
        updatedFields: result.updatedFields,
      },
    });
  }
);

export default router;
