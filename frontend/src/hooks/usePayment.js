import { useState } from 'react';
import * as paymentService from '../services/payment.service';

export const usePayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPaymentHistory();
      setPayments(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch payment history');
    } finally { setLoading(false); }
  };

  return { payments, loading, error, fetchHistory };
};