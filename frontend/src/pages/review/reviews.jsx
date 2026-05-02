import { useEffect, useState } from 'react';
import { getMyReviews } from '../../services/review.service';
import { formatDate } from '../../utils/formatedate';
import Spinner from '../../components/shared/Spinner';

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyReviews()
      .then(res => setReviews(res.data?.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load reviews'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding:'40px', color:'red' }}>{error}</div>;

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>My Reviews</h2>
      {reviews.length === 0 ? <p style={styles.empty}>No reviews yet.</p> : (
        reviews.map(r => (
          <div key={r.review_id} style={styles.card}>
            <div style={styles.header}>
              <div>
                <h3 style={styles.hotel}>{r.hotel_name}</h3>
                <p style={styles.room}>{r.type_name}</p>
              </div>
              <div style={styles.rating}>⭐ {r.overall_rating}</div>
            </div>
            {r.title && <p style={styles.title}>{r.title}</p>}
            {r.body && <p style={styles.body}>{r.body}</p>}
            {r.host_response && (
              <div style={styles.response}>
                <strong>Host Response:</strong> {r.host_response}
              </div>
            )}
            <p style={styles.date}>{formatDate(r.created_at)}</p>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'760px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', marginBottom:'20px' },
  empty: { color:'#666', textAlign:'center', padding:'40px' },
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'24px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' },
  hotel: { margin:'0 0 4px', fontSize:'18px', fontWeight:'700' },
  room: { color:'#888', margin:0, fontSize:'13px' },
  rating: { fontSize:'20px', fontWeight:'700', color:'#1a1a2e' },
  title: { fontWeight:'600', fontSize:'15px', marginBottom:'6px' },
  body: { color:'#555', fontSize:'14px', marginBottom:'8px' },
  response: { background:'#f0f4ff', padding:'10px', borderRadius:'8px', fontSize:'13px', marginBottom:'8px' },
  date: { color:'#aaa', fontSize:'12px', margin:0 }
};

export default MyReviewsPage;