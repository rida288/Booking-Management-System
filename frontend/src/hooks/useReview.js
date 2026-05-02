import { useState } from 'react';
import * as reviewService from '../services/review.service';

export const useReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchByHotel = async (hotelId) => {
    setLoading(true);
    try {
      const res = await reviewService.getReviewsByHotel(hotelId);
      setReviews(res.data?.data || []);
    } finally { setLoading(false); }
  };

  return { reviews, loading, fetchByHotel };
};