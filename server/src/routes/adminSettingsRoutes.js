import express from "express";
import {
  getSettings,
  updateSettings,
  updateSiteSettings,
  updatePaymentSettings,
  resetSettings,
} from "../controllers/adminSettingsController.js";

const router = express.Router();

router.route("/")
  .get(getSettings)
  .put(updateSettings);

router.put("/site", updateSiteSettings);
router.put("/payment", updatePaymentSettings);
router.post("/reset", resetSettings);

export default router;
