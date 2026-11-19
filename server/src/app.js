import express from "express";
import cors from "cors";
import path from "path";
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

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "QuickTable Restaurant Server is running!",
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

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
