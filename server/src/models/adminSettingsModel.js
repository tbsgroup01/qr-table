import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AdminSettings = sequelize.define(
  "AdminSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    navbarLogo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    faviconIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    platformName: {
      type: DataTypes.STRING,
      defaultValue: "QuickTable",
    },
    platformTagline: {
      type: DataTypes.STRING,
      defaultValue: "QR Menu, Table Ordering & Diner Arcade",
    },
    supportEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    supportHotline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpayKeyId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpayKeySecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isRazorpayLive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "admin_settings",
  }
);

export default AdminSettings;
