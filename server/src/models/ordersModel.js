import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    table: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Dinner Guest",
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Diner Guest",
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    guests: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    itemsSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    servingMode: {
      type: DataTypes.STRING,
      defaultValue: "Waiter",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: "UPI",
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("In Kitchen", "Ready to Serve", "Completed", "Cancelled"),
      defaultValue: "In Kitchen",
    },
  },
  {
    timestamps: true,
    tableName: "orders",
  }
);

export default Order;
