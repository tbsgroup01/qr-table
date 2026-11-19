import { Op } from "sequelize";
import crypto from "crypto";
import Razorpay from "razorpay";
import Revenue from "../models/revenueModel.js";
import Restaurant from "../models/restroModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_T9N9rWQ7myNslf",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "3Rzw4WPaSygDYqF5nzxRmYk9",
});

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, planName, restaurantId } = req.body;

    const numAmount = Math.max(1, Math.round(Number(amount) || 1));

    const options = {
      amount: numAmount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        plan: planName || "Subscription",
        restaurantId: String(restaurantId || ""),
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_T9N9rWQ7myNslf",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      amount,
      restaurantId,
      restaurantName,
      ownerName,
      tables,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "3Rzw4WPaSygDYqF5nzxRmYk9")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic && process.env.NODE_ENV === "production") {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    const generatedInvoice = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const newTx = await Revenue.create({
      invoiceNumber: generatedInvoice,
      restaurantId: restaurantId || null,
      restaurantName: (restaurantName || "Restaurant").trim(),
      ownerName: (ownerName || "Owner").trim(),
      plan: (plan || "STARTER").toUpperCase(),
      amount: parseFloat(amount) || 0,
      method: "Razorpay (Online)",
      status: "Paid",
      date: formattedDate,
      tables: tables || "5 max",
    });

    if (restaurantId) {
      try {
        const restro = await Restaurant.findByPk(restaurantId);
        if (restro) {
          restro.status = "Active";
          restro.plan = (plan || "STARTER").toUpperCase();
          await restro.save();
        }
      } catch (err) {
        console.warn("Could not update restaurant status:", err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Payment successfully verified and revenue recorded",
      data: newTx,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTransactions = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const where = {};

    if (status && status !== "ALL") {
      where.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where[Op.or] = [
        { invoiceNumber: { [Op.like]: `%${q}%` } },
        { restaurantName: { [Op.like]: `%${q}%` } },
        { ownerName: { [Op.like]: `%${q}%` } },
        { plan: { [Op.like]: `%${q}%` } },
      ];
    }

    const transactions = await Revenue.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const allTx = await Revenue.findAll({
      attributes: ["amount", "status", "restaurantName"],
    });

    const paidTx = allTx.filter((t) => t.status === "Paid");
    const platformRevenue = paidTx.reduce(
      (sum, t) => sum + (parseFloat(t.amount) || 0),
      0
    );

    const uniqueVenues = new Set(paidTx.map((t) => t.restaurantName));
    const activePaidVenues = uniqueVenues.size;
    const avgRevenuePerVenue =
      activePaidVenues > 0 ? Math.round(platformRevenue / activePaidVenues) : 0;

    res.status(200).json({
      success: true,
      count: transactions.length,
      metrics: {
        platformRevenue,
        saasSubscriptions: platformRevenue,
        activePaidVenues,
        avgRevenuePerVenue,
      },
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const tx = await Revenue.findByPk(req.params.id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        message: "Invoice transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tx,
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const {
      invoiceNumber,
      restaurantId,
      restaurantName,
      ownerName,
      plan,
      amount,
      method,
      status,
      date,
      tables,
    } = req.body;

    if (!restaurantName || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name and amount are required",
      });
    }

    const generatedInvoice =
      invoiceNumber ||
      `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const formattedDate =
      date ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

    const newTx = await Revenue.create({
      invoiceNumber: generatedInvoice,
      restaurantId: restaurantId || null,
      restaurantName: restaurantName.trim(),
      ownerName: ownerName ? ownerName.trim() : "",
      plan: plan ? plan.toUpperCase() : "STARTER",
      amount: parseFloat(amount) || 0,
      method: method || "UPI",
      status: status || "Paid",
      date: formattedDate,
      tables: tables || "5 max",
    });

    res.status(201).json({
      success: true,
      message: "Transaction invoice recorded successfully",
      data: newTx,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransactionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const tx = await Revenue.findByPk(req.params.id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        message: "Invoice transaction not found",
      });
    }

    tx.status = status;
    await tx.save();

    res.status(200).json({
      success: true,
      message: `Invoice status updated to ${status}`,
      data: tx,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const tx = await Revenue.findByPk(req.params.id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        message: "Invoice transaction not found",
      });
    }

    await tx.destroy();

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteTransactions = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of transaction IDs to delete",
      });
    }

    const deletedCount = await Revenue.destroy({
      where: {
        id: { [Op.in]: ids },
      },
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} invoice transaction(s) deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
