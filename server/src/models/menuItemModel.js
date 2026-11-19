import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const MenuItem = sequelize.define(
  "MenuItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "",
    },
    diet: {
      type: DataTypes.ENUM("Vegetarian", "Non-Vegetarian"),
      defaultValue: "Vegetarian",
      comment: "",
    },
    isVeg: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "",
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "menu_items",
  }
);

export default MenuItem;
