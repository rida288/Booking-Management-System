import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../services/bookings.service';

const BookingForm = ({ roomType, hotelName }) => {
  const [form, setForm] = useState({ checkIn:'', checkOut:'', numGuests:1, numRooms:1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
    : 0;
  const total = nights * form.numRooms * (roomType?.base_price_per_night || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createBooking({ roomTypeId: roomType.room_type_id, ...form });
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const f = (k) => (e) => setForm({...form, [k]: e.target.value});

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Book: {roomType?.type_name}</h3>
      <p style={styles.hotel}>at {hotelName}</p>
      <p style={styles.price}>${roomType?.base_price_per_night}/night · max {roomType?.max_occupancy} guests</p>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Check-in</label>
            <input style={styles.input} type="date" value={form.checkIn} onChange={f('checkIn')} required />
          </div>
          <div>
            <label style={styles.label}>Check-out</label>
            <input style={styles.input} type="date" value={form.checkOut} onChange={f('checkOut')} required />
          </div>
          <div>
            <label style={styles.label}>Guests</label>
            <input style={styles.input} type="number" min="1" max={roomType?.max_occupancy || 10} value={form.numGuests} onChange={f('numGuests')} required />
          </div>
          <div>
            <label style={styles.label}>Rooms</label>
            <input style={styles.input} type="number" min="1" value={form.numRooms} onChange={f('numRooms')} required />
          </div>
        </div>
        {nights > 0 && (
          <div style={styles.summary}>
            {nights} night(s) × {form.numRooms} room(s) = <strong>${total.toFixed(2)}</strong>
          </div>
        )}
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  card: { background:'#fff', padding:'28px', borderRadius:'12px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' },
  title: { margin:'0 0 4px', fontSize:'20px' },
  hotel: { color:'#666', margin:'0 0 4px', fontSize:'14px' },
  price: { color:'#e94560', fontWeight:'600', margin:'0 0 20px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' },
  label: { display:'block', marginBottom:'4px', fontWeight:'500', fontSize:'13px' },
  input: { width:'100%', padding:'9px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box' },
  summary: { background:'#f0f2f5', padding:'12px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
  btn: { width:'100%', padding:'12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', cursor:'pointer', fontWeight:'600' }
};

export default BookingForm;