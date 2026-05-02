import { createContext, useState, useCallback } from 'react';
import * as bookingService from '../services/bookings.service';

export const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getBookingHistory(status);
      setBookings(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <BookingContext.Provider value={{ bookings, loading, error, fetchHistory, setBookings }}>
      {children}
    </BookingContext.Provider>
  );
};