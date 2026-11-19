import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  bulkDeleteOrders,
  bulkUpdateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.delete("/bulk/delete", bulkDeleteOrders);
router.patch("/bulk/status", bulkUpdateOrderStatus);

router.route("/")
  .get(getAllOrders)
  .post(createOrder);

router.route("/:id")
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder);

router.patch("/:id/status", updateOrderStatus);

export default router;
