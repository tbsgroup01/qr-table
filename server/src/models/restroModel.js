import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Restaurant = sequelize.define(
  "Restaurant",
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
    owner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    openingTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    closingTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tagline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fssaiNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gstin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    merchantName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    upiId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qrImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    acceptUpiQr: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    acceptCash: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    acceptCards: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    taxPercentage: {
      type: DataTypes.STRING,
      defaultValue: "5",
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    plan: {
      type: DataTypes.STRING,
      defaultValue: "STARTER",
    },
  },
  {
    timestamps: true,
    tableName: "restaurants",
  }
);

export default Restaurant;
