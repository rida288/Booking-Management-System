import api from './api';

export const createReview = (data) => api.post('/reviews', data);
export const getReviewsByHotel = (hotelId) => api.get(`/reviews/hotel/${hotelId}`);
export const getMyReviews = () => api.get('/reviews/my-reviews');
export const getMyPropertyReviews = (hotelId = null) => 
  api.get(hotelId ? `/reviews/my-properties/${hotelId}` : '/reviews/my-properties');
export const respondToReview = (reviewId, hostResponse) => 
  api.patch(`/reviews/${reviewId}/respond`, { hostResponse });
export const getAllReviewsAdmin = () => api.get('/reviews/admin/all');
export const getTopRatedHotels = () => api.get('/reviews/analytics/top-hotels');
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);