import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const QuizPlay = sequelize.define(
  "QuizPlay",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    table: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      defaultValue: "Diner Guest",
    },
    quiz: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dish: {
      type: DataTypes.STRING,
      defaultValue: "None",
    },
    billAmount: {
      type: DataTypes.STRING,
      defaultValue: "₹0",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Dish Won",
    },
    isWinner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "quiz_plays",
  }
);

export default QuizPlay;
