import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { BadRequestError } from "../../errors/BadRequestError";

// Ensure upload directories exist
const UPLOAD_ROOT = path.resolve("uploads");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Create a multer instance for a specific upload category.
 *
 * @param subfolder - sub
 * directory inside uploads/ (e.g. "news", "athletes")
 * @param allowedMimes - allowed MIME types
 * @param maxSizeMB - max file size in megabytes
 */
export function createUploader(
  subfolder: string,
  allowedMimes: string[] = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxSizeMB = 5
) {
  const dest = path.join(UPLOAD_ROOT, subfolder);
  ensureDir(dest);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Invalid file type: ${file.mimetype}. Allowed: ${allowedMimes.join(", ")}`
        )
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  });
}

/**
 * Build the public URL for an uploaded file.
 * In production, replace UPLOAD_ROOT_URL with your CDN or storage bucket URL.
 */
export function getUploadUrl(subfolder: string, filename: string): string {
  const baseUrl = process.env.UPLOAD_BASE_URL || "";
  return `${baseUrl}/uploads/${subfolder}/${filename}`;
}
