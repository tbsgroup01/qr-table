import api from "./api";

export const getAllRestaurants = async () => {
  return await api.get("/restaurants");
};

export const getRestaurantById = async (id) => {
  return await api.get(`/restaurants/${id}`);
};

export const getRestaurantProfile = async (id) => {
  const targetId = id || "profile";
  return await api.get(`/restaurants/${targetId}`);
};

export const createRestaurant = async (restaurantData) => {
  return await api.post("/restaurants", restaurantData);
};

export const updateRestaurant = async (id, restaurantData) => {
  return await api.put(`/restaurants/${id}`, restaurantData);
};

export const updateRestaurantProfile = async (id, data) => {
  const targetId = id || "profile";
  return await api.put(`/restaurants/${targetId}`, data);
};

export const deleteRestaurant = async (id) => {
  return await api.delete(`/restaurants/${id}`);
};

export const bulkDeleteRestaurants = async (ids) => {
  return await api.delete("/restaurants/bulk", { data: { ids } });
};

const restroService = {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantProfile,
  createRestaurant,
  updateRestaurant,
  updateRestaurantProfile,
  deleteRestaurant,
  bulkDeleteRestaurants,
};

export default restroService;
