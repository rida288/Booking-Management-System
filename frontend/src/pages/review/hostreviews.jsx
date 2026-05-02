import { useEffect, useState } from 'react';
import { getMyPropertyReviews, respondToReview } from '../../services/review.service';
import { formatDate } from '../../utils/formatedate';
import Spinner from '../../components/shared/Spinner';

const HostReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responding, setResponding] = useState(null);
  const [response, setResponse] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [showUnresponded, setShowUnresponded] = useState(false);

  useEffect(() => {
    getMyPropertyReviews()
      .then(res => setReviews(res.data?.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load reviews'))
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (reviewId) => {
    if (!response.trim()) return setSubmitError('Response cannot be empty');
    setSubmitError('');
    try {
      await respondToReview(reviewId, response);
      setReviews(prev => prev.map(r =>
        r.review_id === reviewId ? { ...r, host_response: response } : r
      ));
      setResponding(null);
      setResponse('');
    } catch (e) {
      setSubmitError(e.response?.data?.message || 'Failed to submit response');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding:'40px', color:'red' }}>{error}</div>;

  const filtered = showUnresponded ? reviews.filter(r => !r.host_response) : reviews;

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Property Reviews</h2>
      <div style={styles.filters}>
        <button onClick={() => setShowUnresponded(false)}
          style={!showUnresponded ? styles.activeFilter : styles.filter}>
          All
        </button>
        <button onClick={() => setShowUnresponded(true)}
          style={showUnresponded ? styles.activeFilter : styles.filter}>
          Needs Response
        </button>
      </div>
      {filtered.length === 0 ? <p style={styles.empty}>No reviews found.</p> : (
        filtered.map(r => (
          <div key={r.review_id} style={styles.card}>
            <div style={styles.header}>
              <div>
                <h3 style={styles.hotel}>{r.hotel_name}</h3>
                <p style={styles.meta}>{r.guest_name} · {r.type_name} · {formatDate(r.created_at)}</p>
              </div>
              <div style={styles.rating}>⭐ {r.overall_rating}</div>
            </div>
            {r.title && <p style={styles.title}>{r.title}</p>}
            {r.body && <p style={styles.body}>{r.body}</p>}

            {r.host_response ? (
              <div style={styles.response}>
                <strong>Your Response:</strong> {r.host_response}
              </div>
            ) : (
              responding === r.review_id ? (
                <div style={styles.respondBox}>
                  <textarea
                    style={styles.textarea}
                    rows={3}
                    placeholder="Write your response..."
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                  />
                  {submitError && <div style={styles.error}>{submitError}</div>}
                  <div style={styles.btnRow}>
                    <button onClick={() => handleRespond(r.review_id)} style={styles.submitBtn}>Submit</button>
                    <button onClick={() => { setResponding(null); setResponse(''); }} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setResponding(r.review_id)} style={styles.respondBtn}>
                  Respond
                </button>
              )
            )}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'760px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', marginBottom:'16px' },
  filters: { display:'flex', gap:'8px', marginBottom:'20px' },
  filter: { padding:'6px 14px', border:'1px solid #ddd', borderRadius:'20px', background:'#fff', cursor:'pointer', fontSize:'13px' },
  activeFilter: { padding:'6px 14px', border:'1px solid #e94560', borderRadius:'20px', background:'#e94560', color:'#fff', cursor:'pointer', fontSize:'13px' },
  empty: { color:'#666', textAlign:'center', padding:'40px' },
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'24px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' },
  hotel: { margin:'0 0 4px', fontSize:'18px', fontWeight:'700' },
  meta: { color:'#888', margin:0, fontSize:'13px' },
  rating: { fontSize:'20px', fontWeight:'700', color:'#1a1a2e' },
  title: { fontWeight:'600', fontSize:'15px', marginBottom:'6px' },
  body: { color:'#555', fontSize:'14px', marginBottom:'12px' },
  response: { background:'#f0f4ff', padding:'10px', borderRadius:'8px', fontSize:'13px' },
  respondBox: { marginTop:'10px' },
  textarea: { width:'100%', padding:'9px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box', resize:'vertical' },
  error: { background:'#f8d7da', color:'#721c24', padding:'8px', borderRadius:'6px', fontSize:'13px', margin:'8px 0' },
  btnRow: { display:'flex', gap:'8px', marginTop:'8px' },
  submitBtn: { padding:'7px 16px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  cancelBtn: { padding:'7px 16px', background:'#f0f0f0', color:'#333', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  respondBtn: { padding:'7px 16px', background:'#f0f4ff', color:'#1a1a2e', border:'1px solid #c0d0ff', borderRadius:'6px', cursor:'pointer', fontSize:'13px', marginTop:'8px' }
};

export default HostReviewsPage;