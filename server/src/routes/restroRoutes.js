import express from "express";
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  bulkDeleteRestaurants,
} from "../controllers/restroController.js";

const router = express.Router();

router.delete("/bulk", bulkDeleteRestaurants);
router.route("/profile").get(getRestaurantById).put(updateRestaurant);
router.route("/").get(getAllRestaurants).post(createRestaurant);
router.route("/:id").get(getRestaurantById).put(updateRestaurant).delete(deleteRestaurant);

export default router;
