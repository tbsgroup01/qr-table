import api from "./api";

export const getAllAdmins = async () => {
  return await api.get("/admin/get");
};

export const getAdminById = async (id) => {
  return await api.get(`/admin/get/${id}`);
};

export const createAdmin = async (adminData) => {
  return await api.post("/admin/create", adminData);
};

export const updateAdmin = async (id, adminData) => {
  return await api.patch(`/admin/update/${id}`, adminData);
};

export const deleteAdmin = async (id) => {
  return await api.delete(`/admin/delete/${id}`);
};

export const getDashboardOverview = async () => {
  return await api.get("/admin/overview");
};

export const getAdminProfile = async () => {
  return await api.get("/admin/get");
};

export const updateAdminProfile = async (profileData) => {
  return await api.patch("/admin/update/1", profileData);
};

const adminService = {
  getDashboardOverview,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};

export default adminService;
