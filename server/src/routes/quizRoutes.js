import express from "express";
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
  recordQuizPlay,
  getAllQuizPlays,
  checkOrderQuizEligibility,
} from "../controllers/quizController.js";

const router = express.Router();

router.get("/plays", getAllQuizPlays);
router.get("/check-order", checkOrderQuizEligibility);
router.get("/check-order/:orderId", checkOrderQuizEligibility);
router.post("/play", recordQuizPlay);

router.route("/")
  .get(getAllQuizzes)
  .post(createQuiz);

router.route("/:id")
  .get(getQuizById)
  .put(updateQuiz)
  .delete(deleteQuiz);

router.patch("/:id/toggle-status", toggleQuizStatus);
router.post("/:id/play", recordQuizPlay);

export default router;
