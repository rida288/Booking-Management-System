import { Link } from 'react-router-dom';
import StatusBadge from '../shared/StatusBadge';
import { formatCurrency } from '../../utils/formatcurrency';
import { formatDate as fmtDate } from '../../utils/formatedate';

const BookingCard = ({ booking, onCancel }) => {
  const { booking_id, hotel_name, room_type, type_name, check_in_date, check_out_date,
    num_rooms, total_amount, status, discount_percent } = booking;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.hotel}>{hotel_name}</h3>
          <p style={styles.room}>{room_type || type_name}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div style={styles.row}>
        <span>📅 {fmtDate(check_in_date)} → {fmtDate(check_out_date)}</span>
        <span>🛏 {num_rooms} room(s)</span>
      </div>
      <div style={styles.footer}>
        <span style={styles.amount}>
          ${Number(total_amount).toFixed(2)}
          {discount_percent > 0 && <small style={styles.disc}> ({discount_percent}% off)</small>}
        </span>
        <div style={styles.actions}>
          <Link to={`/bookings/${booking_id}`} style={styles.viewBtn}>View</Link>
          {['PENDING','CONFIRMED'].includes(status) && onCancel && (
            <button onClick={() => onCancel(booking_id)} style={styles.cancelBtn}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'10px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' },
  hotel: { margin:'0 0 4px', fontSize:'16px', fontWeight:'700' },
  room: { color:'#666', margin:0, fontSize:'13px' },
  row: { display:'flex', gap:'24px', color:'#555', fontSize:'13px', marginBottom:'14px' },
  footer: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  amount: { fontWeight:'700', fontSize:'16px', color:'#1a1a2e' },
  disc: { color:'#28a745', fontWeight:'400', fontSize:'12px' },
  actions: { display:'flex', gap:'8px' },
  viewBtn: { padding:'6px 14px', background:'#1a1a2e', color:'#fff', borderRadius:'6px', textDecoration:'none', fontSize:'13px' },
  cancelBtn: { padding:'6px 14px', background:'#e94560', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }
};

export default BookingCard;