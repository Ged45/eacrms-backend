import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject, ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Auto-detect if schema expects { body: ... } or flat req.body
      const isWrapped = schema instanceof ZodObject && "body" in schema.shape;
      
      const target = isWrapped
        ? { body: req.body ?? {}, query: req.query, params: req.params }
        : req.body ?? {};

      const parsed = schema.parse(target);

      if (isWrapped && parsed.body) {
        req.body = parsed.body;
      } else if (!isWrapped) {
        req.body = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };
