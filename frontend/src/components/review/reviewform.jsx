import { useState } from 'react';
import { createReview } from '../../services/review.service';

const ReviewForm = ({ bookingId, hotelId, roomTypeId, onSuccess }) => {
  const [form, setForm] = useState({ overall_rating:5, title:'', body:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReview({ ...form, bookingId, hotelId, roomTypeId });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={{ margin:'0 0 16px' }}>Write a Review</h3>
      {error && <div style={styles.error}>{error}</div>}
      <label style={styles.label}>Rating (1-5)</label>
      <input style={styles.input} type="number" min="1" max="5" step="0.5"
        value={form.overall_rating} onChange={e => setForm({...form, overall_rating: e.target.value})} required />
      <label style={styles.label}>Title</label>
      <input style={styles.input} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
      <label style={styles.label}>Review</label>
      <textarea style={styles.textarea} rows={4} value={form.body}
        onChange={e => setForm({...form, body: e.target.value})} />
      <button style={styles.btn} type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

const styles = {
  form: { background:'#fff', padding:'24px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'13px' },
  label: { display:'block', marginBottom:'4px', fontWeight:'500', fontSize:'13px' },
  input: { width:'100%', padding:'9px 12px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'14px', fontSize:'14px', boxSizing:'border-box' },
  textarea: { width:'100%', padding:'9px 12px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'14px', fontSize:'14px', boxSizing:'border-box', resize:'vertical' },
  btn: { width:'100%', padding:'10px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer', fontWeight:'600' }
};

export default ReviewForm;