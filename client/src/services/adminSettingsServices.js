import api from "./api";

export const getSettings = async () => {
  return await api.get("/settings");
};

export const updateSettings = async (settingsData) => {
  return await api.put("/settings", settingsData);
};

export const updateSiteSettings = async (siteData) => {
  return await api.put("/settings/site", siteData);
};

export const updatePaymentSettings = async (paymentData) => {
  return await api.put("/settings/payment", paymentData);
};

export const resetSettings = async () => {
  return await api.post("/settings/reset");
};

const adminSettingsService = {
  getSettings,
  updateSettings,
  updateSiteSettings,
  updatePaymentSettings,
  resetSettings,
};

export default adminSettingsService;
