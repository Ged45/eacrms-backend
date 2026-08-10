import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "5000", 10);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
    console.log(`Swagger UI: http://127.0.0.1:${PORT}/api-docs`);
});