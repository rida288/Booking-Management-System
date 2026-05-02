import { useState } from 'react';
import { processPayment } from '../../services/payment.service';
import { PAYMENT_METHOD } from '../../utils/constants';

const PaymentForm = ({ bookingId, amount, onSuccess }) => {
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!method) return setError('Please select a payment method');
    setLoading(true);
    setError('');
    try {
      await processPayment({ bookingId, amount, paymentMethod: method });
      onSuccess?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Make Payment</h3>
      <p style={styles.amount}>Amount Due: <strong>${Number(amount).toFixed(2)}</strong></p>

      <div style={styles.methods}>
        {Object.values(PAYMENT_METHOD).map(m => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            style={method === m ? styles.methodActive : styles.method}
          >
            {m.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading} style={styles.btn}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

const styles = {
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'24px', marginBottom:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  heading: { fontSize:'18px', marginBottom:'12px', color:'#1a1a2e' },
  amount: { fontSize:'15px', marginBottom:'20px', color:'#555' },
  methods: { display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'20px' },
  method: { padding:'8px 16px', border:'1px solid #ddd', borderRadius:'8px', background:'#f8f9fa', cursor:'pointer', fontSize:'13px' },
  methodActive: { padding:'8px 16px', border:'1px solid #e94560', borderRadius:'8px', background:'#e94560', color:'#fff', cursor:'pointer', fontSize:'13px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  btn: { width:'100%', padding:'12px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'15px', fontWeight:'600' }
};

export default PaymentForm;