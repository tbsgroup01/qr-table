import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import restroRoutes from "./routes/restroRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import tablesRoutes from "./routes/tablesRoutes.js";
import plansRoutes from "./routes/plansRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");
const uploadsPath = path.join(serverRoot, "uploads");

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use("/uploads", express.static(uploadsPath));

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "QuickTable Restaurant Server is running!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/upload", uploadRoutes);
app.use("/api/restaurants", restroRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/settings", adminSettingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
