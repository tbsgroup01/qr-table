import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Revenue = sequelize.define(
  "Revenue",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    restaurantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "STARTER",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "UPI",
    },
    status: {
      type: DataTypes.ENUM("Paid", "Pending", "Failed"),
      defaultValue: "Paid",
    },
    date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tables: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "revenues",
  }
);

export default Revenue;
