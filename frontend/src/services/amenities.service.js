import api from './api';

export const getAmenitiesByRoom = (roomId) =>
  api.get(`/amenities/room/${roomId}`);
