import express, { Request, Response, NextFunction } from "express";
import healthRoutes from "./modules/health/health.routes";
const app = express();
app.use(express.json());
app.use("/health", healthRoutes);
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log("Incoming request");
    next();
});

app.get("/", (req: Request, res: Response) => {
   res.json({
    name: "EACRMS Backend",
    version: "1.0.0",
    status: "running"
});
});

export default app;