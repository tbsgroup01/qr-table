import api from "./api";

export const getAllTransactions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/revenue?${query}` : "/revenue";
  return await api.get(endpoint);
};

export const getTransactionById = async (id) => {
  return await api.get(`/revenue/${id}`);
};

export const createTransaction = async (transactionData) => {
  return await api.post("/revenue", transactionData);
};

export const updateTransactionStatus = async (id, status) => {
  return await api.patch(`/revenue/${id}/status`, { status });
};

export const deleteTransaction = async (id) => {
  return await api.delete(`/revenue/${id}`);
};

export const bulkDeleteTransactions = async (ids) => {
  return await api.delete("/revenue/bulk/delete", { body: { ids } });
};

export const createRazorpayOrder = async (orderData) => {
  return await api.post("/revenue/razorpay/create-order", orderData);
};

export const verifyRazorpayPayment = async (paymentData) => {
  return await api.post("/revenue/razorpay/verify-payment", paymentData);
};

const revenueService = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  deleteTransaction,
  bulkDeleteTransactions,
  createRazorpayOrder,
  verifyRazorpayPayment,
};

export default revenueService;
