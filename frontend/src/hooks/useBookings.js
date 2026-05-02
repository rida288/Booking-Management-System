import { useContext } from 'react';
import { BookingContext } from '../context/BookingContext';

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used within BookingProvider');
  return ctx;
};