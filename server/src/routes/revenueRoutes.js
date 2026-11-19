import express from "express";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  deleteTransaction,
  bulkDeleteTransactions,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/revenueController.js";

const router = express.Router();

router.delete("/bulk/delete", bulkDeleteTransactions);

router.post("/razorpay/create-order", createRazorpayOrder);
router.post("/razorpay/verify-payment", verifyRazorpayPayment);

router.route("/")
  .get(getAllTransactions)
  .post(createTransaction);

router.route("/:id")
  .get(getTransactionById)
  .delete(deleteTransaction);

router.patch("/:id/status", updateTransactionStatus);

export default router;
