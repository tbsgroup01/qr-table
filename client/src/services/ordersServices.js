import api from "./api";

export const getAllOrders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/orders?${query}` : "/orders";
  return await api.get(endpoint);
};

export const getOrderById = async (id) => {
  return await api.get(`/orders/${id}`);
};

export const createOrder = async (orderData) => {
  return await api.post("/orders", orderData);
};

export const updateOrder = async (id, orderData) => {
  return await api.put(`/orders/${id}`, orderData);
};

export const updateOrderStatus = async (id, status) => {
  return await api.patch(`/orders/${id}/status`, { status });
};

export const deleteOrder = async (id) => {
  return await api.delete(`/orders/${id}`);
};

export const bulkDeleteOrders = async (ids) => {
  return await api.delete("/orders/bulk/delete", { body: { ids } });
};

export const bulkUpdateOrderStatus = async (ids, status) => {
  return await api.patch("/orders/bulk/status", { ids, status });
};

const ordersService = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  bulkDeleteOrders,
  bulkUpdateOrderStatus,
};

export default ordersService;
