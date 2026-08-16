import api from './axios';

// Users
export const getUsers = async () => {
  const response = await api.get('/users/');
  return response.data;
};

export const updateUser = async (id: number, data: any) => {
  const response = await api.patch(`/users/${id}/`, data);
  return response.data;
};

// Dashboard Statistics
export const getDashboardStats = async () => {
  const response = await api.get('/user-statistics/');
  return response.data;
};

// Support/Feedback
export const getSupportTickets = async () => {
  const response = await api.get('/support/');
  return response.data;
};

export const updateSupportTicket = async (id: number, data: any) => {
  const response = await api.patch(`/support/${id}/`, data);
  return response.data;
};

// Categories (Settings)
export const getCategories = async (endpoint: string) => {
  const response = await api.get(`/${endpoint}/`);
  return response.data;
};

export const createCategory = async (endpoint: string, data: any, hasFile = false) => {
  const headers = hasFile ? { 'Content-Type': 'multipart/form-data' } : undefined;
  const response = await api.post(`/${endpoint}/`, data, { headers });
  return response.data;
};

export const updateCategory = async (endpoint: string, id: number, data: any, hasFile = false) => {
  const headers = hasFile ? { 'Content-Type': 'multipart/form-data' } : undefined;
  const response = await api.patch(`/${endpoint}/${id}/`, data, { headers });
  return response.data;
};

export const deleteCategory = async (endpoint: string, id: number) => {
  const response = await api.delete(`/${endpoint}/${id}/`);
  return response.data;
};
