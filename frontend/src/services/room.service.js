import api from './api';

export const getRoomsByHotel = (hotelId) =>
  api.get(`/rooms/hotel/${hotelId}`);
export const createRoom = (data) => api.post('/rooms', data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);