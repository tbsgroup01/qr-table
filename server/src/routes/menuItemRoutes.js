import express from "express";
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  bulkDeleteMenuItems,
  bulkUpdateAvailability,
} from "../controllers/menuController.js";

const router = express.Router();

router.delete("/bulk/delete", bulkDeleteMenuItems);
router.patch("/bulk/availability", bulkUpdateAvailability);

router.route("/")
  .get(getAllMenuItems)
  .post(createMenuItem);

router.route("/:id")
  .get(getMenuItemById)
  .put(updateMenuItem)
  .delete(deleteMenuItem);

router.patch("/:id/toggle-availability", toggleAvailability);

export default router;
