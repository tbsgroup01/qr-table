import api from "./api";

export const getAllMenuItems = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/menu?${query}` : "/menu";
  return await api.get(endpoint);
};

export const getMenuItemById = async (id) => {
  return await api.get(`/menu/${id}`);
};

export const createMenuItem = async (itemData) => {
  return await api.post("/menu", itemData);
};

export const updateMenuItem = async (id, itemData) => {
  return await api.put(`/menu/${id}`, itemData);
};

export const deleteMenuItem = async (id) => {
  return await api.delete(`/menu/${id}`);
};

export const toggleMenuItemAvailability = async (id) => {
  return await api.patch(`/menu/${id}/toggle-availability`);
};

export const bulkDeleteMenuItems = async (ids) => {
  return await api.delete("/menu/bulk/delete", { body: { ids } });
};

export const bulkUpdateAvailability = async (ids, isAvailable) => {
  return await api.patch("/menu/bulk/availability", { ids, isAvailable });
};

const menuItemService = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  bulkDeleteMenuItems,
  bulkUpdateAvailability,
};

export default menuItemService;
