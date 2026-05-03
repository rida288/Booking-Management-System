import api from './api';

export const getAllUsers = () => api.get('/users');
export const searchUsers = (keyword) => api.get('/users/search', { params: { keyword } });
export const changeUserRole = (userId, role) => api.patch(`/users/${userId}/role`, { role });
export const changeUserStatus = (userId, isActive) => api.patch(`/users/${userId}/status`, { isActive });
