import api from './api';

export const getAdminDashboard = () => api.get('/dashboard/admin');
export const getHostDashboard = () => api.get('/dashboard/host');