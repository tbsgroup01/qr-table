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

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
