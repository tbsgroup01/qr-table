import api from "./api";

export const getAllPlans = async () => {
  return await api.get("/plans");
};

export const getPlanById = async (id) => {
  return await api.get(`/plans/${id}`);
};

export const createPlan = async (planData) => {
  return await api.post("/plans", planData);
};

export const updatePlan = async (id, planData) => {
  return await api.put(`/plans/${id}`, planData);
};

export const deletePlan = async (id) => {
  return await api.delete(`/plans/${id}`);
};

export const togglePlanStatus = async (id) => {
  return await api.patch(`/plans/${id}/status`);
};

const plansService = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
};

export default plansService;
