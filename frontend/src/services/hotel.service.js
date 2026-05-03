import api from './api';

export const getHotels = (params) => api.get('/hotels', { params });
export const getHotelById = (id) => api.get(`/hotels/${id}`);