import api from './api';

export const getAmenitiesByRoom = (roomId) =>
  api.get(`/amenities/room/${roomId}`);
export const getAllAmenities = () => api.get('/amenities');
export const getHotelAmenities = (hotelId) => api.get(`/amenities/hotel/${hotelId}`);
export const addHotelAmenity = (hotelId, amenityId) => api.post(`/amenities/hotel/${hotelId}`, { amenityId });
export const removeHotelAmenity = (hotelId, amenityId) => api.delete(`/amenities/hotel/${hotelId}/${amenityId}`);
export const getRoomTypeAmenities = (roomTypeId) => api.get(`/amenities/room/${roomTypeId}`);