import api from './api';

export const createReview = (data) => api.post('/reviews', data);
export const getReviewsByHotel = (hotelId) => api.get(`/reviews/hotel/${hotelId}`);
export const getMyReviews = () => api.get('/reviews/my');