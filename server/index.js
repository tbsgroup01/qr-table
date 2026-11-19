import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import sequelize from "./src/config/db.js";

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Database Connected Successfully!");
    await sequelize.sync();
    console.log("Models Synchronized!");
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await sequelize.close();
      } catch {}
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer();
