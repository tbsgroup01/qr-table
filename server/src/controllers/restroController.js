import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Restaurant from "../models/restroModel.js";
import Table from "../models/tablesModel.js";
import Revenue from "../models/revenueModel.js";

const getJwtSecret = () => process.env.JWT_SECRET || "quicktable_secure_jwt_secret_key_2026";

const resolveRestaurantFromRequest = async (req) => {
  const id = req.params?.id;
  if (id && id !== "profile" && id !== "current" && id !== "undefined" && !isNaN(id)) {
    const byId = await Restaurant.findByPk(id);
    if (byId) return byId;
  }

  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, getJwtSecret());
      if (decoded && decoded.id && decoded.role === "restaurant") {
        const byToken = await Restaurant.findByPk(decoded.id);
        if (byToken) return byToken;
      }
    } catch {}
  }

  return await Restaurant.findOne({
    order: [["createdAt", "DESC"]],
  });
};

export const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll({
      order: [["createdAt", "DESC"]],
    });

    let activeQrTables = 0;
    try {
      activeQrTables = await Table.count({
        where: { isActive: true },
      });
      if (activeQrTables === 0) {
        activeQrTables = await Table.count();
      }
    } catch (e) {}

    let platformRevenue = 0;
    try {
      const revenues = await Revenue.findAll({
        attributes: ["amount", "status"],
      });
      platformRevenue = revenues
        .filter((r) => r.status === "Paid" || !r.status)
        .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    } catch (e) {}

    const enhancedRestaurants = await Promise.all(
      restaurants.map(async (r) => {
        const item = r.toJSON ? r.toJSON() : { ...r };
        try {
          item.tablesCount = await Table.count({
            where: { restaurantId: r.id },
          });
        } catch {
          item.tablesCount = 0;
        }
        return item;
      })
    );

    const totalRestaurants = restaurants.length;
    const activeVenues = restaurants.filter((r) => r.status === "Active").length;

    res.status(200).json({
      success: true,
      count: totalRestaurants,
      metrics: {
        totalRestaurants,
        activeVenues,
        activeQrTables,
        platformRevenue,
      },
      data: enhancedRestaurants,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await resolveRestaurantFromRequest(req);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const item = restaurant.toJSON ? restaurant.toJSON() : { ...restaurant };
    try {
      item.tablesCount = await Table.count({
        where: { restaurantId: restaurant.id },
      });
    } catch {
      item.tablesCount = 0;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (req, res, next) => {
  try {
    const { name, restaurantName, owner, ownerName, email, phone, address, status, plan, password } = req.body;
    const finalName = (name || restaurantName || "").trim();

    if (!finalName) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    const hashedPassword = password ? await bcrypt.hash(password.trim(), 10) : null;

    const newRestaurant = await Restaurant.create({
      name: finalName,
      owner: (owner || ownerName || "").trim() || null,
      email: email ? email.trim() : null,
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      status: status || "Active",
      plan: plan || "STARTER",
    });

    res.status(201).json({
      success: true,
      message: "Restaurant registered successfully",
      data: newRestaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await resolveRestaurantFromRequest(req);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const updateData = { ...req.body };
    if (updateData.password && String(updateData.password).trim()) {
      updateData.password = await bcrypt.hash(String(updateData.password).trim(), 10);
    } else {
      delete updateData.password;
    }

    await restaurant.update(updateData);

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }
    await restaurant.destroy();
    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteRestaurants = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of restaurant IDs to delete",
      });
    }

    const deletedCount = await Restaurant.destroy({
      where: {
        id: { [Op.in]: ids },
      },
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} restaurant(s) deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
