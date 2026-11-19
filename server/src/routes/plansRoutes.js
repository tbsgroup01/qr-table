import express from "express";
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
} from "../controllers/plansController.js";

const router = express.Router();

router.route("/")
  .get(getAllPlans)
  .post(createPlan);

router.route("/:id")
  .get(getPlanById)
  .put(updatePlan)
  .delete(deletePlan);

router.patch("/:id/status", togglePlanStatus);

export default router;
