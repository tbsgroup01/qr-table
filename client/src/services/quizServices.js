import api from "./api";

export const getAllQuizzes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/quiz?${query}` : "/quiz";
  return await api.get(endpoint);
};

export const getQuizById = async (id) => {
  return await api.get(`/quiz/${id}`);
};

export const createQuiz = async (quizData) => {
  return await api.post("/quiz", quizData);
};

export const updateQuiz = async (id, quizData) => {
  return await api.put(`/quiz/${id}`, quizData);
};

export const deleteQuiz = async (id) => {
  return await api.delete(`/quiz/${id}`);
};

export const toggleQuizStatus = async (id) => {
  return await api.patch(`/quiz/${id}/toggle-status`);
};

export const recordQuizPlay = async (id, isWinner = false) => {
  return await api.post(`/quiz/${id}/play`, { isWinner });
};

export const getAllQuizPlays = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/quiz/plays?${query}` : "/quiz/plays";
  return await api.get(endpoint);
};

export const checkOrderQuizEligibility = async (orderId) => {
  const cleanId = String(orderId || "").trim();
  return await api.get(`/quiz/check-order?orderId=${encodeURIComponent(cleanId)}`);
};

export const recordQuizPlaySession = async (playData) => {
  return await api.post("/quiz/play", playData);
};

const quizService = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
  recordQuizPlay,
  getAllQuizPlays,
  checkOrderQuizEligibility,
  recordQuizPlaySession,
};

export default quizService;
