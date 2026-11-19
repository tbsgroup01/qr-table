import api from "./api";

export const loginUser = async ({ email, password }) => {
  return await api.post("/auth/login", { email, password });
};

export const getMe = async () => {
  return await api.get("/auth/me");
};

export const requestPasswordOtp = async (email) => {
  return await api.post("/auth/forgot-password", { email });
};

export const submitResetPassword = async ({ email, newPassword }) => {
  return await api.post("/auth/reset-password", { email, newPassword });
};

const authServices = {
  loginUser,
  getMe,
  requestPasswordOtp,
  submitResetPassword,
};

export default authServices;
