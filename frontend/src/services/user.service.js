import api from './api';

export const getAllUsers = (role) => api.get('/admin/users', { params: { role } });
export const searchUsers = (name) => api.get('/admin/users/search', { params: { name } });
export const changeUserRole = (email, role) => api.patch('/admin/users/role', { email, role });
export const changeUserStatus = (email, status) => api.patch('/admin/users/status', { email, status });