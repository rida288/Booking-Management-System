import api from './api';

export const processPayment = (data) => api.post('/payments', data);
export const getPaymentStatus = (bookingId) => api.get(`/payments/booking/${bookingId}`);
export const getPaymentHistory = () => api.get('/payments/history');
export const getAuditTrail = (bookingId) => api.get(`/payments/audit/${bookingId}`);