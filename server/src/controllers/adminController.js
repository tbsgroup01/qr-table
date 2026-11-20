import { Op } from "sequelize";
import bcrypt from "bcrypt";
import Admin from "../models/adminModel.js";
import Restaurant from "../models/restroModel.js";
import Table from "../models/tablesModel.js";
import Revenue from "../models/revenueModel.js";
import QuizPlay from "../models/quizPlayModel.js";

export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, role, password, address, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Admin name, email and password are required",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await Admin.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      role: role ? role.trim() : null,
      password: hashedPassword,
      address: address ? address.trim() : null,
      avatar: avatar || null,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        address: newAdmin.address,
        avatar: newAdmin.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const updateAdmin = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id || 1;

    let admin = await Admin.findByPk(id);
    if (!admin) {
      admin = await Admin.findOne();
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    const {
      name,
      email,
      phone,
      role,
      avatar,
      address,
      currentPassword,
      newPassword,
    } = req.body;

    if (newPassword && newPassword.trim()) {
      if (currentPassword && admin.password) {
        const isMatch = admin.password.startsWith("$2")
          ? await bcrypt.compare(currentPassword, admin.password)
          : currentPassword === admin.password;
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: "Current password does not match",
          });
        }
      }
      admin.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    if (name !== undefined) admin.name = name.trim();
    if (email !== undefined) admin.email = email ? email.trim() : null;
    if (phone !== undefined) admin.phone = phone ? phone.trim() : null;
    if (role !== undefined) admin.role = role ? role.trim() : admin.role;
    if (avatar !== undefined) admin.avatar = avatar;
    if (address !== undefined) admin.address = address ? address.trim() : null;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    await admin.destroy();
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (req, res, next) => {
  try {
    const id = req.params.id || req.query.id;
    if (id) {
      const admin = await Admin.findByPk(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: admin,
      });
    }

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardOverview = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll({
      order: [["createdAt", "DESC"]],
    });

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

    const quizPlays = await QuizPlay.findAll({
      order: [["createdAt", "DESC"]],
    });

    const uniquePlayersSet = new Set(
      quizPlays
        .map((p) => p.customerName || p.sessionId)
        .filter((n) => n && n !== "Diner Guest")
    );
    const totalPlayers =
      uniquePlayersSet.size > 0
        ? uniquePlayersSet.size
        : new Set(quizPlays.map((p) => p.sessionId || p.id)).size;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const gamesPlayedToday = quizPlays.filter((p) => {
      try {
        return new Date(p.createdAt) >= startOfToday;
      } catch {
        return false;
      }
    }).length;

    const revenues = await Revenue.findAll({
      where: { status: "Paid" },
      order: [["createdAt", "ASC"]],
    });

    const platformRevenue = revenues.reduce(
      (sum, r) => sum + (parseFloat(r.amount) || 0),
      0
    );

    const planCounts = {};
    restaurants.forEach((r) => {
      const rawPlan = (r.plan || "Starter").trim();
      const planName =
        rawPlan.toUpperCase() === "STARTER"
          ? "Starter Plan"
          : rawPlan.toUpperCase() === "PRO GROWTH" || rawPlan.toUpperCase() === "PRO"
          ? "Pro Growth"
          : rawPlan.toUpperCase() === "PREMIUM"
          ? "Premium Plan"
          : rawPlan.toUpperCase() === "ENTERPRISE"
          ? "Enterprise Plan"
          : `${rawPlan} Plan`;

      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });

    const planColors = {
      "Starter Plan": { bg: "bg-emerald-500", text: "text-emerald-500", stroke: "#10b981" },
      "Pro Growth": { bg: "bg-orange-500", text: "text-orange-500", stroke: "#f97316" },
      "Premium Plan": { bg: "bg-purple-500", text: "text-purple-500", stroke: "#a855f7" },
      "Enterprise Plan": { bg: "bg-blue-500", text: "text-blue-500", stroke: "#3b82f6" },
    };

    const subscriptionDistribution = Object.entries(planCounts).map(
      ([planName, count]) => {
        const percentage =
          totalRestaurants > 0
            ? Math.round((count / totalRestaurants) * 100)
            : 0;
        const color = planColors[planName] || {
          bg: "bg-cyan-500",
          text: "text-cyan-500",
          stroke: "#06b6d4",
        };
        return {
          name: planName,
          count,
          percentage,
          ...color,
        };
      }
    );

    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = d.toLocaleDateString("en-US", { month: "short" });
      last6Months.push({
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        month: mName,
        amount: 0,
      });
    }

    revenues.forEach((rev) => {
      const d = new Date(rev.createdAt || rev.date);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      const bucket = last6Months.find((b) => b.monthIndex === mIdx && b.year === y);
      if (bucket) {
        bucket.amount += parseFloat(rev.amount) || 0;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalRestaurants,
          activeVenues,
          totalPlayers: totalPlayers || quizPlays.length,
          gamesPlayedToday,
          totalGamesPlayed: quizPlays.length,
          platformRevenue,
        },
        restaurants: enhancedRestaurants,
        subscriptionDistribution,
        revenueTrajectory: last6Months.map(({ month, amount }) => ({
          month,
          amount,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
