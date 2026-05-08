import api from './api';

export const reportDefect = (data) =>
  api.post('/defects', data);

export const getDefects = () => api.get('/defects/active');
export const updateDefectStatus = (id, status) => api.patch(`/defects/${id}/status`, { status });