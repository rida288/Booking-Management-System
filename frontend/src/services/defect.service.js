import api from './api';

export const reportDefect = (data) =>
  api.post('/defects', data);

export const getDefects = () =>
  api.get('/defects');