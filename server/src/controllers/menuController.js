import { Op } from "sequelize";
import MenuItem from "../models/menuItemModel.js";
import { SEED_MENU_ITEMS } from "../data/menuSeedData.js";

export const getAllMenuItems = async (req, res, next) => {
  try {
    const totalExisting = await MenuItem.count();
    if (totalExisting === 0) {
      await MenuItem.bulkCreate(SEED_MENU_ITEMS);
    }

    const { search, diet } = req.query;

    const where = {};

    if (search && search.trim() !== "") {
      where[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
        { category: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    if (diet === "VEG" || diet === "Vegetarian") {
      where.diet = "Vegetarian";
    } else if (diet === "NON_VEG" || diet === "Non-Vegetarian") {
      where.diet = "Non-Vegetarian";
    }

    const items = await MenuItem.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const allItems = await MenuItem.findAll({
      attributes: ["id", "isAvailable", "diet", "isVeg"],
    });

    const totalItems = allItems.length;
    const availableCount = allItems.filter((i) => i.isAvailable).length;
    const outOfStockCount = allItems.filter((i) => !i.isAvailable).length;
    const vegCount = allItems.filter(
      (i) => i.diet === "Vegetarian" || i.isVeg === true
    ).length;
    const nonVegCount = totalItems - vegCount;

    res.status(200).json({
      success: true,
      count: items.length,
      metrics: {
        totalItems,
        availableCount,
        outOfStockCount,
        vegCount,
        nonVegCount,
      },
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu dish not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      diet,
      isVeg,
      image,
      description,
      isAvailable,
    } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Dish name and price are required",
      });
    }

    let finalDiet = diet;
    let finalIsVeg = isVeg;

    if (finalDiet === "Vegetarian" || finalDiet === "Non-Vegetarian") {
      finalIsVeg = finalDiet === "Vegetarian";
    } else if (typeof finalIsVeg === "boolean") {
      finalDiet = finalIsVeg ? "Vegetarian" : "Non-Vegetarian";
    } else {
      finalDiet = "Vegetarian";
      finalIsVeg = true;
    }

    const newItem = await MenuItem.create({
      name: name.trim(),
      category: category ? category.trim() : "Main Course",
      price: parseFloat(price) || 0,
      diet: finalDiet,
      isVeg: finalIsVeg,
      image: image || "",
      description: description || "",
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    res.status(201).json({
      success: true,
      message: "New dish added successfully",
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu dish not found",
      });
    }

    const {
      name,
      category,
      price,
      diet,
      isVeg,
      image,
      description,
      isAvailable,
    } = req.body;

    let updatedDiet = diet;
    let updatedIsVeg = isVeg;

    if (updatedDiet === "Vegetarian" || updatedDiet === "Non-Vegetarian") {
      updatedIsVeg = updatedDiet === "Vegetarian";
    } else if (typeof updatedIsVeg === "boolean") {
      updatedDiet = updatedIsVeg ? "Vegetarian" : "Non-Vegetarian";
    }

    await item.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category: category.trim() }),
      ...(price !== undefined && { price: parseFloat(price) || 0 }),
      ...(updatedDiet !== undefined && { diet: updatedDiet }),
      ...(updatedIsVeg !== undefined && { isVeg: updatedIsVeg }),
      ...(image !== undefined && { image }),
      ...(description !== undefined && { description }),
      ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
    });

    res.status(200).json({
      success: true,
      message: "Dish updated successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu dish not found",
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Dish marked as ${item.isAvailable ? "Available" : "Sold Out"}`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu dish not found",
      });
    }

    await item.destroy();
    res.status(200).json({
      success: true,
      message: "Dish deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteMenuItems = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of dish IDs to delete",
      });
    }

    const deletedCount = await MenuItem.destroy({
      where: {
        id: { [Op.in]: ids },
      },
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} dish(es) deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateAvailability = async (req, res, next) => {
  try {
    const { ids, isAvailable } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of dish IDs",
      });
    }

    await MenuItem.update(
      { isAvailable: Boolean(isAvailable) },
      { where: { id: { [Op.in]: ids } } }
    );

    res.status(200).json({
      success: true,
      message: `Updated availability status for ${ids.length} dish(es)`,
    });
  } catch (error) {
    next(error);
  }
};
