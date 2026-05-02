import api from './api';

export const createBooking = (data) => api.post('/bookings', data);
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const confirmBooking = (id) => api.patch(`/bookings/${id}/confirm`);
export const completeBooking = (id) => api.patch(`/bookings/${id}/complete`);
export const cancelBooking = (id, cancellationReason) =>
  api.patch(`/bookings/${id}/cancel`, { cancellationReason });
export const getBookingHistory = (status) =>
  api.get('/bookings/history', { params: status ? { status } : {} });
export const purgeOldBookings = () => api.delete('/bookings/purge-old');