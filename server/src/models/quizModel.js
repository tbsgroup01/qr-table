import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Quiz = sequelize.define(
  "Quiz",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reward: {
      type: DataTypes.STRING,
      defaultValue: "Free Hot Gulab Jamun (2 Pcs)",
    },
    duration: {
      type: DataTypes.STRING,
      defaultValue: "2 mins",
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    questionsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    plays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    winners: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: "quizzes",
  }
);

export default Quiz;
