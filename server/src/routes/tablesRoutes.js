import express from "express";
import {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  bulkDeleteTables,
} from "../controllers/tableController.js";

const router = express.Router();

router.delete("/bulk/delete", bulkDeleteTables);

router.route("/")
  .get(getAllTables)
  .post(createTable);

router.route("/:id")
  .get(getTableById)
  .put(updateTable)
  .delete(deleteTable);

router.patch("/:id/status", updateTableStatus);

export default router;
