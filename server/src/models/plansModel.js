import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Plan = sequelize.define(
  "Plan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    billingCycle: {
      type: DataTypes.STRING,
      defaultValue: "month",
    },
    tagline: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tablesLimit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "5 Tables Max",
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    colorTheme: {
      type: DataTypes.STRING,
      defaultValue: "orange",
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: "plans",
  }
);

export default Plan;
