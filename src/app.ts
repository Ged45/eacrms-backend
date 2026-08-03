import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";

import router from "./routes";
import { AppError } from "./errors/AppError";
import { swaggerSpec } from "./docs/swagger";

const app = express();

app.use(express.json());

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
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

export default app;