import { Router } from "express";
import { createUploader, getUploadUrl } from "../../lib/uploads/multer.config";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { uploadLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();
const upload = createUploader("news", undefined, 5);

/**
 * POST /api/v1/news/upload/image
 * Upload a single image for a news article.
 * Requires authentication and news:create permission.
 */
router.post(
  "/image",
  uploadLimiter,
  authenticate,
  authorize("news:create"),
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded." });
      return;
    }

    const url = getUploadUrl("news", req.file.filename);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }
);

/**
 * POST /api/v1/news/upload/images
 * Upload multiple images (up to 10) for a news article gallery.
 * Requires authentication and news:create permission.
 */
router.post(
  "/images",
  uploadLimiter,
  authenticate,
  authorize("news:create"),
  upload.array("files", 10),
  (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: "No files uploaded." });
      return;
    }

    const urls = files.map((f) => ({
      url: getUploadUrl("news", f.filename),
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    }));

    res.status(201).json({
      success: true,
      message: `${files.length} image(s) uploaded successfully.`,
      data: urls,
    });
  }
);

export default router;
