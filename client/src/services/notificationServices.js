import api from "./api";

export const getAllNotifications = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/notifications?${query}` : "/notifications";
  return await api.get(endpoint);
};

export const markNotificationAsRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (restaurantId = 1) => {
  return await api.patch("/notifications/read-all", { restaurantId });
};

export const deleteNotification = async (id) => {
  return await api.delete(`/notifications/${id}`);
};

export const clearAllNotifications = async (restaurantId = 1) => {
  return await api.delete("/notifications/clear-all", { data: { restaurantId } });
};

const notificationServices = {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
};

export default notificationServices;
