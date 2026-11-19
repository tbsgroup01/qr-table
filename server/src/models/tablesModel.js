import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Table = sequelize.define(
  "Table",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tableName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seatingCapacity: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qrCodeUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("Available", "Occupied", "Reserved"),
      defaultValue: "Available",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "tables",
    indexes: [
      {
        unique: true,
        fields: ["restaurantId", "tableNumber"],
      },
    ],
  }
);

export default Table;
