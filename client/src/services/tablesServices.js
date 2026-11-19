import api from "./api";

export const getAllTables = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/tables?${query}` : "/tables";
  return await api.get(endpoint);
};

export const getTableById = async (id) => {
  return await api.get(`/tables/${id}`);
};

export const createTable = async (tableData) => {
  return await api.post("/tables", tableData);
};

export const updateTable = async (id, tableData) => {
  return await api.put(`/tables/${id}`, tableData);
};

export const updateTableStatus = async (id, status) => {
  return await api.patch(`/tables/${id}/status`, { status });
};

export const deleteTable = async (id) => {
  return await api.delete(`/tables/${id}`);
};

export const bulkDeleteTables = async (ids) => {
  return await api.delete("/tables/bulk/delete", { body: { ids } });
};

const tablesService = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  bulkDeleteTables,
};

export default tablesService;
