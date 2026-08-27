import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// OpenAPI / Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount all v1 API routes
app.use("/api/v1", routes);

// 404 Catch-all handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Global Centralized Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ [UNHANDLED ERROR]:", err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
