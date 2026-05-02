import { useEffect, useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { cancelBooking } from '../../services/bookings.service';
import BookingCard from './BookingCard';
import Spinner from '../shared/Spinner';
import { BOOKING_STATUS } from '../../utils/constants';

const BookingHistory = () => {
  const { bookings, loading, error, fetchHistory } = useBookings();
  const [filter, setFilter] = useState('');
  const [cancelError, setCancelError] = useState('');

  useEffect(() => { fetchHistory(filter || null); }, [filter]);

  const handleCancel = async (bookingId) => {
    const reason = prompt('Please provide a cancellation reason:');
    if (!reason) return;
    try {
      await cancelBooking(bookingId, reason);
      fetchHistory(filter || null);
    } catch (e) {
      setCancelError(e.response?.data?.message || 'Cancellation failed');
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>My Bookings</h2>
      <div style={styles.filters}>
        {['', ...Object.values(BOOKING_STATUS)].map(s => (
          <button key={s} style={filter === s ? styles.activeFilter : styles.filter}
            onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>
      {cancelError && <div style={styles.error}>{cancelError}</div>}
      {loading ? <Spinner /> : error ? <div style={styles.error}>{error}</div> :
        bookings.length === 0 ? <p style={styles.empty}>No bookings found.</p> :
        bookings.map(b => <BookingCard key={b.booking_id} booking={b} onCancel={handleCancel} />)
      }
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'760px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', marginBottom:'16px' },
  filters: { display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' },
  filter: { padding:'6px 14px', border:'1px solid #ddd', borderRadius:'20px', background:'#fff', cursor:'pointer', fontSize:'13px' },
  activeFilter: { padding:'6px 14px', border:'1px solid #e94560', borderRadius:'20px', background:'#e94560', color:'#fff', cursor:'pointer', fontSize:'13px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  empty: { color:'#666', textAlign:'center', padding:'40px' }
};

export default BookingHistory;