import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "5000", 10);
const HOST = "0.0.0.0";

console.log("[STARTUP] Starting server...");

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});

// Handle server errors
server.on("error", (err: any) => {
  console.error("❌ [SERVER ERROR]:", err);
  process.exit(1);
});

server.on("clientError", (err: any, socket: any) => {
  console.error("❌ [CLIENT ERROR]:", err);
  if (socket.writable) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

process.on("unhandledRejection", (reason: any) => {
  console.error("❌ [UNHANDLED REJECTION]:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err: any) => {
  console.error("❌ [UNCAUGHT EXCEPTION]:", err);
  process.exit(1);
});