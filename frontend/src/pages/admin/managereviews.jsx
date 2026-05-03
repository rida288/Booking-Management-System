import { useEffect, useState } from 'react';
import { getAllReviewsAdmin, getTopRatedHotels, deleteReview } from '../../services/review.service';
import StatusBadge from '../../components/shared/StatusBadge';
import Spinner from '../../components/shared/Spinner';
import { formatDate } from '../../utils/formatedate';

const ManageReviews = () => {
  const [tab, setTab] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [topHotels, setTopHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (tab === 'all') {
          const res = await getAllReviewsAdmin();
          setReviews(res.data?.data || []);
        } else if (tab === 'top') {
          const res = await getTopRatedHotels();
          setTopHotels(res.data?.data || []);
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load data');
      } finally { setLoading(false); }
    };
    load();
  }, [tab]);

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setDeleting(reviewId);
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.review_id !== reviewId));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete review');
    } finally { setDeleting(null); }
  };

  const renderAll = () => (
    reviews.length === 0 ? <p style={styles.empty}>No reviews found.</p> : (
      reviews.map(r => (
        <div key={r.review_id} style={styles.card}>
          <div style={styles.header}>
            <div>
              <h3 style={styles.hotel}>{r.hotel_name}</h3>
              <p style={styles.meta}>{r.guest_name} · {r.type_name} · {formatDate(r.created_at)}</p>
            </div>
            <div style={styles.right}>
              <span style={styles.rating}>⭐ {r.overall_rating}</span>
              <button
                onClick={() => handleDelete(r.review_id)}
                disabled={deleting === r.review_id}
                style={styles.deleteBtn}>
                {deleting === r.review_id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
          {r.title && <p style={styles.title}>{r.title}</p>}
          {r.body && <p style={styles.body}>{r.body}</p>}
          {r.host_response && (
            <div style={styles.response}>
              <strong>Host Response:</strong> {r.host_response}
            </div>
          )}
        </div>
      ))
    )
  );

  const renderTopHotels = () => (
    topHotels.length === 0 ? <p style={styles.empty}>No data found.</p> : (
      <table style={styles.table}>
        <thead>
          <tr>{['Hotel','City','Country','Stars','Reviews','Avg Rating'].map(h => (
            <th key={h} style={styles.th}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {topHotels.map(h => (
            <tr key={h.hotel_id} style={styles.tr}>
              <td style={styles.td}>{h.hotel_name}</td>
              <td style={styles.td}>{h.city}</td>
              <td style={styles.td}>{h.country}</td>
              <td style={styles.td}>{h.star_rating} ⭐</td>
              <td style={styles.td}>{h.total_reviews}</td>
              <td style={styles.td}>{h.star_rating} ⭐</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Manage Reviews</h2>
      <div style={styles.tabs}>
        {[['all', 'All Reviews'], ['top', 'Top Rated Hotels']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={tab === key ? styles.activeTab : styles.tab}>
            {label}
          </button>
        ))}
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {loading ? <Spinner /> : tab === 'all' ? renderAll() : renderTopHotels()}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'900px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', marginBottom:'16px' },
  tabs: { display:'flex', gap:'8px', marginBottom:'20px' },
  tab: { padding:'8px 20px', border:'1px solid #ddd', borderRadius:'8px', background:'#fff', cursor:'pointer', fontSize:'14px' },
  activeTab: { padding:'8px 20px', border:'1px solid #1a1a2e', borderRadius:'8px', background:'#1a1a2e', color:'#fff', cursor:'pointer', fontSize:'14px' },
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'24px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' },
  hotel: { margin:'0 0 4px', fontSize:'18px', fontWeight:'700' },
  meta: { color:'#888', margin:0, fontSize:'13px' },
  right: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' },
  rating: { fontSize:'18px', fontWeight:'700', color:'#1a1a2e' },
  title: { fontWeight:'600', fontSize:'15px', marginBottom:'6px' },
  body: { color:'#555', fontSize:'14px', marginBottom:'8px' },
  response: { background:'#f0f4ff', padding:'10px', borderRadius:'8px', fontSize:'13px' },
  deleteBtn: { padding:'5px 12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  th: { background:'#1a1a2e', color:'#fff', padding:'12px 16px', textAlign:'left', fontSize:'13px' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'12px 16px', fontSize:'13px', color:'#333' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  empty: { color:'#666', textAlign:'center', padding:'40px' }
};

export default ManageReviews;