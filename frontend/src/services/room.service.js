import api from './api';

export const getRoomsByHotel = (hotelId) =>
  api.get(`/rooms/hotel/${hotelId}`);