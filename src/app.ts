import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import router from "./routes";
import { AppError } from "./errors/AppError";
import { swaggerSpec } from "./docs/swagger";

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        name: "EACRMS Backend",
        version: "1.0.0",
        status: "running",
    });
});

// Swagger UI Documentation
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

// Raw OpenAPI JSON Spec Endpoint
app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(swaggerSpec);
});

// Primary API v1 Routes
app.use("/api/v1", router);

// Unmatched Route (404) Fallback Handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});

// Global Error Handling Middleware
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    console.error("Unhandled Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

export default app;