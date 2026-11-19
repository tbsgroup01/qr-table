import { Op } from "sequelize";
import Quiz from "../models/quizModel.js";
import QuizPlay from "../models/quizPlayModel.js";
import Notification from "../models/notificationModel.js";

export const getAllQuizzes = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (search && search.trim() !== "") {
      where[Op.or] = [
        { title: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
        { reward: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const quizzes = await Quiz.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const allQuizzes = await Quiz.findAll({
      attributes: ["id", "status", "plays", "winners"],
    });

    const totalQuizzes = allQuizzes.length;
    const activeCount = allQuizzes.filter((q) => q.status === "Active").length;
    const inactiveCount = totalQuizzes - activeCount;
    const totalPlays = allQuizzes.reduce((sum, q) => sum + (q.plays || 0), 0);
    const totalWinners = allQuizzes.reduce((sum, q) => sum + (q.winners || 0), 0);

    const parsedQuizzes = quizzes.map((q) => {
      const item = q.toJSON ? q.toJSON() : { ...q };
      if (typeof item.questions === "string") {
        try {
          item.questions = JSON.parse(item.questions);
        } catch {
          item.questions = [];
        }
      }
      return item;
    });

    res.status(200).json({
      success: true,
      count: parsedQuizzes.length,
      metrics: {
        totalQuizzes,
        activeCount,
        inactiveCount,
        totalPlays,
        totalWinners,
      },
      data: parsedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const item = quiz.toJSON ? quiz.toJSON() : { ...quiz };
    if (typeof item.questions === "string") {
      try {
        item.questions = JSON.parse(item.questions);
      } catch {
        item.questions = [];
      }
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, reward, duration, status, questions } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    const questionsList = Array.isArray(questions) ? questions : [];

    const newQuiz = await Quiz.create({
      title: title.trim(),
      description: description || "",
      reward: reward || "Free Dessert",
      duration: duration || "2 mins",
      status: status || "Active",
      questionsCount: questionsList.length,
      questions: questionsList,
      plays: 0,
      winners: 0,
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: newQuiz,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const { title, description, reward, duration, status, questions } = req.body;

    if (title !== undefined) quiz.title = title.trim();
    if (description !== undefined) quiz.description = description;
    if (reward !== undefined) quiz.reward = reward;
    if (duration !== undefined) quiz.duration = duration;
    if (status !== undefined) quiz.status = status;
    if (questions !== undefined && Array.isArray(questions)) {
      quiz.questions = questions;
      quiz.questionsCount = questions.length;
    }

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    await quiz.destroy();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const toggleQuizStatus = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    quiz.status = quiz.status === "Active" ? "Inactive" : "Active";
    await quiz.save();

    res.status(200).json({
      success: true,
      message: `Quiz status changed to ${quiz.status}`,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQuizPlays = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (search && search.trim() !== "") {
      const q = search.trim();
      where[Op.or] = [
        { table: { [Op.like]: `%${q}%` } },
        { customerName: { [Op.like]: `%${q}%` } },
        { quiz: { [Op.like]: `%${q}%` } },
        { dish: { [Op.like]: `%${q}%` } },
        { sessionId: { [Op.like]: `%${q}%` } },
        { orderId: { [Op.like]: `%${q}%` } },
      ];
    }

    if (status && status !== "ALL") {
      if (status === "SERVED") {
        where.status = "Dish Served";
      } else if (status === "ACTIVE") {
        where.status = "Active on Table";
      } else {
        where.status = status;
      }
    }

    const plays = await QuizPlay.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const allPlays = await QuizPlay.findAll({
      attributes: ["id", "isWinner", "dish", "billAmount", "status"],
    });

    const totalPlays = allPlays.length;
    const freeDishesWon = allPlays.filter((p) => p.isWinner).length;
    const totalRevenueDriven = allPlays
      .filter((p) => p.isWinner)
      .reduce((sum, p) => {
        const num = parseFloat(String(p.billAmount || 0).replace(/[^0-9.]/g, "")) || 0;
        return sum + num;
      }, 0);

    res.status(200).json({
      success: true,
      count: plays.length,
      metrics: {
        totalPlays,
        freeDishesWon,
        totalRevenueDriven,
      },
      data: plays,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOrderQuizEligibility = async (req, res, next) => {
  try {
    const rawOrderId = req.query.orderId || req.params.orderId;
    if (!rawOrderId || !String(rawOrderId).trim()) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const orderId = decodeURIComponent(String(rawOrderId).trim());
    const stripped = orderId.replace(/^#+/, "");

    const existingPlay = await QuizPlay.findOne({
      where: {
        [Op.or]: [
          { orderId },
          { orderId: `#${stripped}` },
          { orderId: stripped },
        ],
      },
    });

    if (existingPlay) {
      return res.status(200).json({
        success: true,
        canPlay: false,
        message: "A quiz game has already been played for this order",
        data: existingPlay,
      });
    }

    res.status(200).json({
      success: true,
      canPlay: true,
      message: "Order is eligible to play quiz",
    });
  } catch (error) {
    next(error);
  }
};

export const recordQuizPlay = async (req, res, next) => {
  try {
    const {
      orderId,
      table,
      customerName,
      quizTitle,
      score,
      dish,
      billAmount,
      isWinner,
      quizId,
    } = req.body;

    if (!table || !quizTitle || !score) {
      return res.status(400).json({
        success: false,
        message: "Table, quiz title, and score are required",
      });
    }

    // Enforce 1 quiz play per order
    if (orderId && orderId.trim()) {
      const alreadyPlayed = await QuizPlay.findOne({
        where: { orderId: orderId.trim() },
      });

      if (alreadyPlayed) {
        return res.status(400).json({
          success: false,
          alreadyPlayed: true,
          message: `Table order ${orderId} has already played a quiz! Only 1 game allowed per order.`,
          data: alreadyPlayed,
        });
      }
    }

    const sessionNum = Math.floor(1000 + Math.random() * 9000);
    const newSessionId = `QS-${sessionNum}`;

    const newPlay = await QuizPlay.create({
      sessionId: newSessionId,
      orderId: orderId && orderId.trim() ? orderId.trim() : null,
      table: table || "Table 01",
      customerName: customerName && customerName.trim() ? customerName.trim() : "Diner Guest",
      quiz: quizTitle,
      score: score,
      dish: dish && dish.trim() ? dish.trim() : (isWinner ? "Free Dessert" : "None (<70% Score)"),
      billAmount: billAmount || "₹0",
      status: isWinner ? "Active on Table" : "Not Qualified",
      isWinner: Boolean(isWinner),
    });

    try {
      await Notification.create({
        restaurantId: 1,
        type: "QUIZ",
        title: `${table || "Table"} Played Trivia!`,
        message: `${customerName && customerName.trim() ? customerName.trim() : "Diner"} scored ${score} in "${quizTitle}"${isWinner ? ` and won ${newPlay.dish}!` : "."}`,
        table: table || "Table 01",
        orderId: orderId && orderId.trim() ? orderId.trim() : null,
        isRead: false,
      });
    } catch (notifErr) {
      // non-blocking
    }

    // Also update overall quiz stats in Quiz model if quizId provided or by title
    try {
      const quiz = quizId
        ? await Quiz.findByPk(quizId)
        : await Quiz.findOne({ where: { title: quizTitle } });
      if (quiz) {
        quiz.plays = (quiz.plays || 0) + 1;
        if (isWinner) {
          quiz.winners = (quiz.winners || 0) + 1;
        }
        await quiz.save();
      }
    } catch (e) {
      // ignore
    }

    res.status(201).json({
      success: true,
      message: "Quiz session recorded successfully",
      data: newPlay,
    });
  } catch (error) {
    next(error);
  }
};
