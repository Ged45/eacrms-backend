import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";

import router from "./routes";
import { AppError } from "./errors/AppError";
import { swaggerSpec } from "./docs/swagger";

const app = express();

app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/v1", router);

// Swagger UI
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: "EACRMS API Docs",
        swaggerOptions: {
            persistAuthorization: true,
        },
    })
);

// Expose raw OpenAPI JSON
app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

app.get("/", (_req, res) => {
    res.json({
        name: "EACRMS Backend",
        version: "1.0.0",
        status: "running",
    });
});

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        const body: Record<string, unknown> = {
            success: false,
            message: err.message,
            error: {
                code: err.code,
                status: err.statusCode,
            },
        };
        if (err.entity) (body.error as Record<string, unknown>).entity = err.entity;
        if (err.field) (body.error as Record<string, unknown>).field = err.field;
        res.status(err.statusCode).json(body);
        return;
    }

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

export default app;