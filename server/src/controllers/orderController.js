import { Op } from "sequelize";
import Order from "../models/ordersModel.js";
import Notification from "../models/notificationModel.js";

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const where = {};

    if (status && status !== "ALL") {
      if (status === "KITCHEN") {
        where.status = "In Kitchen";
      } else if (status === "READY") {
        where.status = "Ready to Serve";
      } else if (status === "COMPLETED") {
        where.status = "Completed";
      } else {
        where.status = status;
      }
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where[Op.or] = [
        { orderId: { [Op.like]: `%${q}%` } },
        { table: { [Op.like]: `%${q}%` } },
        { itemsSummary: { [Op.like]: `%${q}%` } },
      ];
    }

    const orders = await Order.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const allOrders = await Order.findAll({
      attributes: ["id", "status"],
    });

    const totalOrders = allOrders.length;
    const inKitchenCount = allOrders.filter((o) => o.status === "In Kitchen").length;
    const readyCount = allOrders.filter((o) => o.status === "Ready to Serve").length;
    const completedCount = allOrders.filter((o) => o.status === "Completed").length;

    res.status(200).json({
      success: true,
      count: orders.length,
      metrics: {
        totalOrders,
        inKitchenCount,
        readyCount,
        completedCount,
      },
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const {
      orderId,
      table,
      guests,
      items,
      itemsSummary,
      note,
      servingMode,
      amount,
      paymentMethod,
      isPaid,
    } = req.body;

    if (!table || !items || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Table, items, and amount are required",
      });
    }

    // Check if an active running order exists for this table (not completed or cancelled)
    const activeOrder = await Order.findOne({
      where: {
        table,
        status: {
          [Op.in]: ["In Kitchen", "Ready to Serve"],
        },
      },
      order: [["createdAt", "DESC"]],
    });

    if (activeOrder) {
      let existingItems = [];
      try {
        existingItems =
          typeof activeOrder.items === "string"
            ? JSON.parse(activeOrder.items)
            : activeOrder.items || [];
      } catch {
        existingItems = [];
      }

      const incomingList = Array.isArray(items) ? items : [];
      for (const inc of incomingList) {
        const incName = inc.name || "Item";
        const incQty = parseInt(inc.qty, 10) || 1;
        const incUnitPrice =
          parseFloat(inc.unitPrice) ||
          (parseFloat(String(inc.price || 0).replace(/[^0-9.]/g, "")) / incQty) ||
          0;

        const found = existingItems.find(
          (i) => i.name && i.name.toLowerCase().trim() === incName.toLowerCase().trim()
        );

        if (found) {
          const prevQty = parseInt(found.qty, 10) || 1;
          found.qty = prevQty + incQty;
          found.price = `₹${Math.round(incUnitPrice * found.qty)}`;
          found.unitPrice = incUnitPrice;
        } else {
          existingItems.push({
            name: incName,
            qty: incQty,
            unitPrice: incUnitPrice,
            price: typeof inc.price === "string" ? inc.price : `₹${Math.round(incUnitPrice * incQty)}`,
          });
        }
      }

      const mergedSummary = existingItems
        .map((i) => `${i.qty || 1}x ${i.name || "Item"}`)
        .join(", ");

      const newTotalAmount =
        (parseFloat(activeOrder.amount) || 0) + (parseFloat(amount) || 0);

      let mergedNote = activeOrder.note || "None";
      if (note && note !== "None" && note.trim() !== "") {
        mergedNote =
          mergedNote === "None"
            ? note.trim()
            : `${mergedNote} | Extra: ${note.trim()}`;
      }

      activeOrder.items = existingItems;
      activeOrder.itemsSummary = mergedSummary;
      activeOrder.amount = newTotalAmount;
      activeOrder.note = mergedNote;
      activeOrder.status = "In Kitchen"; // Send back to kitchen so chefs prepare newly added items
      if (isPaid !== undefined) {
        activeOrder.isPaid = Boolean(isPaid);
      }

      await activeOrder.save();

      try {
        await Notification.create({
          restaurantId: 1,
          type: "ORDER",
          title: `New Items Added: ${activeOrder.orderId}`,
          message: `${table} added items: ${incomingList.map((i) => `${i.qty || 1}x ${i.name || "Item"}`).join(", ")} (Total: ₹${newTotalAmount})`,
          table: table,
          orderId: activeOrder.orderId,
          isRead: false,
        });
      } catch (notifErr) {
        // non-blocking
      }

      return res.status(200).json({
        success: true,
        message: `Items added to active order ${activeOrder.orderId} for ${table}`,
        isMerged: true,
        data: activeOrder,
      });
    }

    const generatedOrderId =
      orderId || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    let computedSummary = itemsSummary;
    if (!computedSummary && Array.isArray(items)) {
      computedSummary = items
        .map((i) => `${i.qty || 1}x ${i.name || "Item"}`)
        .join(", ");
    }

    const newOrder = await Order.create({
      orderId: generatedOrderId,
      table,
      guests: guests || 2,
      items,
      itemsSummary: computedSummary || "",
      note: note || "None",
      servingMode: servingMode || "Waiter",
      amount: parseFloat(amount) || 0,
      paymentMethod: paymentMethod || "UPI",
      isPaid: isPaid !== undefined ? Boolean(isPaid) : false,
      status: "In Kitchen",
    });

    try {
      await Notification.create({
        restaurantId: 1,
        type: "ORDER",
        title: `New Order ${generatedOrderId} Received`,
        message: `${table} placed an order for ₹${parseFloat(amount) || 0} (${computedSummary || "Items"})`,
        table: table,
        orderId: generatedOrderId,
        isRead: false,
      });
    } catch (notifErr) {
      // non-blocking
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      isMerged: false,
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, isPaid } = req.body;

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (status) {
      order.status = status;
    }
    if (isPaid !== undefined) {
      order.isPaid = Boolean(isPaid);
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.update(req.body);

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.destroy();

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteOrders = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of order IDs to delete",
      });
    }

    const deletedCount = await Order.destroy({
      where: {
        id: { [Op.in]: ids },
      },
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} order(s) deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateOrderStatus = async (req, res, next) => {
  try {
    const { ids, status, isPaid } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs and status",
      });
    }

    const updatePayload = { status };
    if (isPaid !== undefined) {
      updatePayload.isPaid = Boolean(isPaid);
    }

    await Order.update(updatePayload, {
      where: {
        id: { [Op.in]: ids },
      },
    });

    res.status(200).json({
      success: true,
      message: `Updated status for ${ids.length} order(s)`,
    });
  } catch (error) {
    next(error);
  }
};
