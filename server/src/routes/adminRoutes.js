import express from "express";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmin,
  getDashboardOverview,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/overview", getDashboardOverview);
router.post("/create", createAdmin);
router.patch("/update/:id", updateAdmin);
router.patch("/update", updateAdmin);
router.delete("/delete/:id", deleteAdmin);
router.get("/get/:id", getAdmin);
router.get("/get", getAdmin);

export default router;
