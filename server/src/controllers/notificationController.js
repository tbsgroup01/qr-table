import Notification from "../models/notificationModel.js";

export const getAllNotifications = async (req, res, next) => {
  try {
    const { restaurantId = 1, limit = 50 } = req.query;

    const notifications = await Notification.findAll({
      where: { restaurantId },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit, 10) || 50,
    });

    const unreadCount = await Notification.count({
      where: {
        restaurantId,
        isRead: false,
      },
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const {
      restaurantId = 1,
      type = "ORDER",
      title,
      message,
      table,
      orderId,
      metadata,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }
    const notification = await Notification.create({
      restaurantId,
      type,
      title,
      message,
      table: table || null,
      orderId: orderId || null,
      isRead: false,
      metadata: metadata || null,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const restaurantId = req.body?.restaurantId || req.query?.restaurantId || 1;

    await Notification.update(
      { isRead: true },
      {
        where: {
          restaurantId,
          isRead: false,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    await notification.destroy();
    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const clearAllNotifications = async (req, res, next) => {
  try {
    const restaurantId = req.body?.restaurantId || req.query?.restaurantId || 1;
    await Notification.destroy({
      where: { restaurantId },
    });
    res.status(200).json({
      success: true,
      message: "All notifications cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};
