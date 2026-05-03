import api from './api';

export const processPayment = (data) => api.post('/payments', data);
export const getPaymentStatus = (bookingId) => api.get(`/payments/booking/${bookingId}`);
export const getPaymentHistory = () => api.get('/payments/history');
export const getAuditTrail = (bookingId) => api.get(`/payments/audit/${bookingId}`);
export const getFailedPayments = () => api.get('/payments/failed');
export const updatePaymentStatus = (paymentId, status) => api.patch(`/payments/${paymentId}/status`, { status });