import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.delete("/bulk", bulkDeleteUsers);

router.route("/")
  .get(getAllUsers)
  .post(createUser);

router.route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
