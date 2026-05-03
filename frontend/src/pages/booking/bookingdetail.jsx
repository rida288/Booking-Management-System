import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, cancelBooking, completeBooking } from '../../services/bookings.service';
import { getPaymentStatus, getAuditTrail } from '../../services/payment.service';
import { getMyReviews } from '../../services/review.service';
import PaymentForm from '../../components/payments/paymentform';
import StatusBadge from '../../components/shared/StatusBadge';
import Spinner from '../../components/shared/Spinner';
import ReviewForm from '../../components/review/ReviewForm';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatedate';
import { ROLES } from '../../utils/constants';

const BookingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [review, setReview] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBookingById(id);
        setBooking(res.data?.data);
        if (user?.role === ROLES.GUEST) {
          try {
            const pRes = await getPaymentStatus(id);
            setPayment(pRes.data?.data);
          } catch {}
          try {
            const rRes = await getMyReviews();
            const match = rRes.data?.data?.find(r => r.booking_id === id);
            if (match) { setReview(match); setReviewed(true); }
          } catch {}
        }
        if (user?.role === ROLES.ADMIN) {
          try {
            const aRes = await getAuditTrail(id);
            setAuditTrail(aRes.data?.data || []);
          } catch {}
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load booking');
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    const reason = prompt('Cancellation reason:');
    if (!reason) return;
    try {
      await cancelBooking(id, reason);
      navigate('/bookings');
    } catch (e) {
      alert(e.response?.data?.message || 'Cancel failed');
    }
  };

  const handleComplete = async () => {
    try {
      await completeBooking(id);
      setLoading(true);
      getBookingById(id).then(res => { setBooking(res.data?.data); setLoading(false); });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to complete booking');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding:'40px', color:'red' }}>{error}</div>;
  if (!booking) return null;

  return (
    <div style={styles.wrap}>
      <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.hotel}>{booking.hotel_name || booking.name}</h2>
            <p style={styles.city}>{booking.city}, {booking.country}</p>
            <p style={styles.room}>{booking.type_name} · {booking.bed_type}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div style={styles.grid}>
          {[
            ['Check-in', formatDate(booking.check_in_date)],
            ['Check-out', formatDate(booking.check_out_date)],
            ['Guests', booking.num_guests],
            ['Rooms', booking.num_rooms],
            ['Price/Night', `$${booking.base_price_per_night}`],
            ['Discount', `${booking.discount_percent}%`],
            ['Total', `$${Number(booking.total_amount).toFixed(2)}`],
            ['Booked On', formatDate(booking.created_at)]
          ].map(([label, val]) => (
            <div key={label} style={styles.cell}>
              <div style={styles.cellLabel}>{label}</div>
              <div style={styles.cellVal}>{val}</div>
            </div>
          ))}
        </div>

        {booking.cancellation_reason && (
          <div style={styles.cancelNote}>
            <strong>Cancellation reason:</strong> {booking.cancellation_reason}
            {booking.cancelled_at && ` · ${formatDate(booking.cancelled_at)}`}
          </div>
        )}

        <div style={styles.btnRow}>
          {booking.status === 'PENDING' && user?.role === ROLES.GUEST && (
            <PaymentForm bookingId={id} amount={booking.total_amount}
              onSuccess={() => {
                setLoading(true);
                getBookingById(id).then(res => { setBooking(res.data?.data); setLoading(false); });
              }} />
          )}
          {['PENDING','CONFIRMED'].includes(booking.status) && 
            (user?.role === ROLES.GUEST || user?.role === ROLES.HOST || user?.role === ROLES.ADMIN) && (
            <button onClick={handleCancel} style={styles.cancelBtn}>Cancel Booking</button>
          )}
          {booking.status === 'CONFIRMED' && user?.role === ROLES.HOST &&
            new Date() >= new Date(booking.check_in_date) && (
            <button onClick={handleComplete} style={styles.completeBtn}>Mark as Completed</button>
          )}
          {booking.status === 'COMPLETED' && user?.role === ROLES.GUEST && !reviewed && (
            <button onClick={() => setShowReview(!showReview)} style={styles.reviewBtn}>
              {showReview ? 'Hide' : 'Write a Review'}
            </button>
          )}
        </div>
      </div>

      {payment && (
        <div style={styles.card}>
          <h3 style={styles.subHeading}>Payment</h3>
          <div style={styles.grid}>
            {[
              ['Type', payment.payment_type],
              ['Amount', `$${Number(payment.amount).toFixed(2)}`],
              ['Method', payment.payment_method],
              ['Status', payment.status],
              ['Date', formatDate(payment.initiated_at)]
            ].map(([label, val]) => (
              <div key={label} style={styles.cell}>
                <div style={styles.cellLabel}>{label}</div>
                <div style={styles.cellVal}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {review && (
        <div style={styles.card}>
          <h3 style={styles.subHeading}>Your Review</h3>
          <div style={styles.grid}>
            {[
              ['Rating', `⭐ ${review.overall_rating}`],
              ['Date', formatDate(review.created_at)],
            ].map(([label, val]) => (
              <div key={label} style={styles.cell}>
                <div style={styles.cellLabel}>{label}</div>
                <div style={styles.cellVal}>{val}</div>
              </div>
            ))}
          </div>
          {review.title && <p style={{ fontWeight:'600', marginBottom:'6px' }}>{review.title}</p>}
          {review.body && <p style={{ color:'#555', fontSize:'14px', marginBottom:'8px' }}>{review.body}</p>}
          {review.host_response && (
            <div style={styles.cancelNote}>
              <strong>Host Response:</strong> {review.host_response}
            </div>
          )}
        </div>
      )}

      {user?.role === ROLES.ADMIN && auditTrail.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.subHeading}>Payment Audit Trail</h3>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Type','Amount','Method','Status','Refund Status','Initiated By','Date'].map(h => (
                <th key={h} style={auditStyles.th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {auditTrail.map(a => (
                <tr key={a.payment_id} style={auditStyles.tr}>
                  <td style={auditStyles.td}>{a.payment_type}</td>
                  <td style={auditStyles.td}>${Number(a.amount).toFixed(2)}</td>
                  <td style={auditStyles.td}>{a.payment_method}</td>
                  <td style={auditStyles.td}><StatusBadge status={a.payment_status} /></td>
                  <td style={auditStyles.td}>{a.refund_status ? <StatusBadge status={a.refund_status} /> : '—'}</td>
                  <td style={auditStyles.td}>{a.refund_initiated_by || '—'}</td>
                  <td style={auditStyles.td}>{formatDate(a.initiated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showReview && (
        <ReviewForm bookingId={id} hotelId={booking.hotel_id} roomTypeId={booking.room_type_id}
          onSuccess={() => { setShowReview(false); setReviewed(true); }} />
      )}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'760px', margin:'0 auto', padding:'32px 16px' },
  back: { background:'none', border:'none', color:'#e94560', cursor:'pointer', fontSize:'14px', marginBottom:'16px', padding:0 },
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'24px', marginBottom:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  hotel: { margin:'0 0 4px', fontSize:'22px', fontWeight:'700' },
  city: { color:'#666', margin:'0 0 4px', fontSize:'14px' },
  room: { color:'#888', margin:0, fontSize:'13px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'14px', marginBottom:'16px' },
  cell: { background:'#f8f9fa', padding:'12px', borderRadius:'8px' },
  cellLabel: { color:'#888', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', marginBottom:'4px' },
  cellVal: { fontWeight:'700', fontSize:'15px', color:'#1a1a2e' },
  cancelNote: { background:'#fff3cd', padding:'12px', borderRadius:'8px', fontSize:'13px', marginBottom:'16px' },
  btnRow: { display:'flex', gap:'10px', flexWrap:'wrap' },
  cancelBtn: { padding:'9px 20px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600' },
  completeBtn: { padding:'9px 20px', background:'#28a745', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600' },
  reviewBtn: { padding:'9px 20px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600' },
  subHeading: { fontSize:'16px', marginBottom:'14px' }
};

const auditStyles = {
  th: { background:'#f8f9fa', padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#888', textTransform:'uppercase', borderBottom:'1px solid #e0e0e0' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'10px 12px', fontSize:'13px', color:'#333' }
};

export default BookingDetailPage;