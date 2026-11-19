import api from "./api";

export const uploadDishImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return await api.post("/upload/dish", formData);
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return await api.post("/upload/profile", formData);
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return await api.post("/upload", formData);
};

const uploadService = {
  uploadDishImage,
  uploadProfileImage,
  uploadImage,
};

export default uploadService;
