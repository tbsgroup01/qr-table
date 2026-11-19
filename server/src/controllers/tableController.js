import { Op } from "sequelize";
import os from "os";
import QRCode from "qrcode";
import Table from "../models/tablesModel.js";
import Restaurant from "../models/restroModel.js";
import Plan from "../models/plansModel.js";

export const getPlanTableLimit = (planName, plansList = []) => {
  const normalized = String(planName || "Starter").trim().toLowerCase();

  const matched = plansList.find((p) => {
    const pName = String(p.name || "").trim().toLowerCase();
    return pName === normalized || normalized.includes(pName) || pName.includes(normalized);
  });

  if (matched && matched.tablesLimit) {
    const limitStr = String(matched.tablesLimit).toLowerCase();
    if (limitStr.includes("unlimited")) return Infinity;
    const match = limitStr.match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }

  if (normalized.includes("enterprise") || normalized.includes("ultimate") || normalized.includes("unlimited")) {
    return Infinity;
  }
  if (normalized.includes("pro") || normalized.includes("growth")) {
    return 25;
  }
  return 5;
};

export const getClientBaseUrl = () => {
  if (process.env.CLIENT_URL && process.env.CLIENT_URL.trim()) {
    return process.env.CLIENT_URL.trim().replace(/\/+$/, "");
  }
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return `http://${iface.address}:5173/qr-tablerestro`;
        }
      }
    }
  } catch (e) {
    // fallback
  }
  return "http://192.168.29.207:5173/qr-tablerestro";
};

export const getAllTables = async (req, res, next) => {
  try {
    const { restaurantId, status, isActive } = req.query;

    const where = {};

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    if (status) {
      where.status = status;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const tables = await Table.findAll({
      where,
      order: [["tableNumber", "ASC"]],
    });

    const clientBaseUrl = getClientBaseUrl();

    // Auto-update any existing tables that have 'localhost' in qrCodeUrl so mobile scan works
    for (const table of tables) {
      const hasLocalhost = table.qrCodeUrl && table.qrCodeUrl.includes("localhost");
      const isMissingQr = !table.qrCode || !table.qrCodeUrl;
      const isMissingBasename = table.qrCodeUrl && !table.qrCodeUrl.includes("/qr-tablerestro/");

      if (hasLocalhost || isMissingQr || isMissingBasename) {
        try {
          const freshQrUrl = `${clientBaseUrl}/menu?restaurantId=${table.restaurantId || 1}&table=${table.tableNumber}`;
          table.qrCodeUrl = freshQrUrl;
          table.qrCode = await QRCode.toDataURL(freshQrUrl, {
            width: 350,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
          await table.save();
        } catch (err) {
          console.warn(`Could not update QR for table ${table.id}:`, err.message);
        }
      }
    }

    const totalTables = tables.length;
    const availableCount = tables.filter((t) => t.status === "Available").length;
    const occupiedCount = tables.filter((t) => t.status === "Occupied").length;
    const reservedCount = tables.filter((t) => t.status === "Reserved").length;

    let planInfo = null;
    if (restaurantId) {
      try {
        const restaurant = await Restaurant.findByPk(restaurantId);
        if (restaurant) {
          const allPlans = await Plan.findAll();
          const maxLimit = getPlanTableLimit(restaurant.plan, allPlans);
          const currentCount = totalTables;
          planInfo = {
            planName: restaurant.plan || "Starter Trial",
            currentCount,
            maxLimit: maxLimit === Infinity ? "Unlimited" : maxLimit,
            maxLimitNumber: maxLimit,
            isUnlimited: maxLimit === Infinity,
            canAddMore: currentCount < maxLimit,
          };
        }
      } catch (pErr) {
        // non-blocking
      }
    }

    res.status(200).json({
      success: true,
      count: totalTables,
      metrics: {
        totalTables,
        availableCount,
        occupiedCount,
        reservedCount,
      },
      planInfo,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

export const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req, res, next) => {
  try {
    const {
      restaurantId,
      tableNumber,
      tableName,
      seatingCapacity,
      qrCode,
      qrCodeUrl,
      status,
      isActive,
    } = req.body;

    if (!restaurantId || !tableNumber) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID and table number are required",
      });
    }

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const allPlans = await Plan.findAll();
    const maxLimit = getPlanTableLimit(restaurant.plan, allPlans);
    const currentTableCount = await Table.count({
      where: { restaurantId },
    });

    if (currentTableCount >= maxLimit) {
      const planName = restaurant.plan || "Starter Trial";
      return res.status(403).json({
        success: false,
        limitReached: true,
        currentCount: currentTableCount,
        maxLimit,
        planName,
        message: `Table limit reached for your ${planName} plan (${currentTableCount}/${maxLimit} tables created). Please upgrade your plan to generate more tables.`,
      });
    }

    const existingTable = await Table.findOne({
      where: {
        restaurantId,
        tableNumber,
      },
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Table ${tableNumber} already exists for this restaurant`,
      });
    }

    const clientBaseUrl = getClientBaseUrl();
    const generatedQrUrl =
      qrCodeUrl && !qrCodeUrl.includes("localhost")
        ? qrCodeUrl
        : `${clientBaseUrl}/menu?restaurantId=${restaurantId}&table=${tableNumber}`;

    let generatedQrImage = qrCode;
    if (!generatedQrImage) {
      try {
        generatedQrImage = await QRCode.toDataURL(generatedQrUrl, {
          width: 350,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
      } catch (qrErr) {
        console.error("QR generation error:", qrErr);
        generatedQrImage = "";
      }
    }

    const newTable = await Table.create({
      restaurantId,
      tableNumber: parseInt(tableNumber, 10),
      tableName: tableName || `Table ${tableNumber}`,
      seatingCapacity: seatingCapacity ? parseInt(seatingCapacity, 10) : 4,
      qrCode: generatedQrImage,
      qrCodeUrl: generatedQrUrl,
      status: status || "Available",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: "Table created and QR generated successfully",
      data: newTable,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const {
      tableName,
      seatingCapacity,
      qrCode,
      qrCodeUrl,
      status,
      isActive,
    } = req.body;

    await table.update({
      ...(tableName !== undefined && { tableName }),
      ...(seatingCapacity !== undefined && {
        seatingCapacity: parseInt(seatingCapacity, 10),
      }),
      ...(qrCode !== undefined && { qrCode }),
      ...(qrCodeUrl !== undefined && { qrCodeUrl }),
      ...(status !== undefined && { status }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    });

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTableStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    table.status = status;
    await table.save();

    res.status(200).json({
      success: true,
      message: `Table status updated to ${status}`,
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    await table.destroy();

    res.status(200).json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteTables = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of table IDs to delete",
      });
    }

    const deletedCount = await Table.destroy({
      where: {
        id: { [Op.in]: ids },
      },
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} table(s) deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
