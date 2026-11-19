import express from "express";
import {
  getAllNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.route("/")
  .get(getAllNotifications)
  .post(createNotification);

router.patch("/read-all", markAllNotificationsAsRead);
router.delete("/clear-all", clearAllNotifications);

router.route("/:id")
  .delete(deleteNotification);

router.patch("/:id/read", markNotificationAsRead);

export default router;
