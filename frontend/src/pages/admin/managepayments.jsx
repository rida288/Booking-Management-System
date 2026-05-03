import { useEffect, useState } from 'react';
import { getPaymentHistory, getFailedPayments, updatePaymentStatus } from '../../services/payment.service';
import StatusBadge from '../../components/shared/StatusBadge';
import Spinner from '../../components/shared/Spinner';
import { formatDate } from '../../utils/formatedate';

const ManagePayments = () => {
  const [tab, setTab] = useState('all');
  const [payments, setPayments] = useState([]);
  const [failed, setFailed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (tab === 'all') {
          const res = await getPaymentHistory();
          setPayments(res.data?.data || []);
        } else if (tab === 'failed') {
          const res = await getFailedPayments();
          setFailed(res.data?.data || []);
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load payments');
      } finally { setLoading(false); }
    };
    load();
  }, [tab]);

  const handleStatusUpdate = async (paymentId, status) => {
    setUpdating(paymentId);
    try {
      await updatePaymentStatus(paymentId, status);
      setPayments(prev => prev.map(p =>
        p.payment_id === paymentId ? { ...p, payment_status: status } : p
      ));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update status');
    } finally { setUpdating(null); }
  };

  const renderAll = () => (
    <table style={styles.table}>
      <thead>
        <tr>{['Guest','Hotel','Type','Amount','Method','Status','Refund Status','Actions','Date'].map(h => (
          <th key={h} style={styles.th}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {payments.map(p => (
          <tr key={p.payment_id} style={styles.tr}>
            <td style={styles.td}>{p.guest_name}</td>
            <td style={styles.td}>{p.hotel_name}</td>
            <td style={styles.td}>{p.payment_type}</td>
            <td style={styles.td}>${Number(p.amount).toFixed(2)}</td>
            <td style={styles.td}>{p.payment_method}</td>
            <td style={styles.td}><StatusBadge status={p.payment_status} /></td>
            <td style={styles.td}>
              {p.refund_status ? <StatusBadge status={p.refund_status} /> : '—'}
            </td>
            <td style={styles.td}>
              {p.payment_status === 'PENDING' && (
                <button
                  onClick={() => handleStatusUpdate(p.payment_id, 'SUCCESSFUL')}
                  disabled={updating === p.payment_id}
                  style={styles.approveBtn}>
                  Approve
                </button>
              )}
              {p.refund_status === 'PENDING' && (
                <button
                  onClick={() => handleStatusUpdate(p.payment_id, 'REFUNDED')}
                  disabled={updating === p.payment_id}
                  style={styles.refundBtn}>
                  Process Refund
                </button>
              )}
              {p.payment_status !== 'PENDING' && !p.refund_status && '—'}
            </td>
            <td style={styles.td}>{formatDate(p.initiated_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFailed = () => (
    <table style={styles.table}>
      <thead>
        <tr>{['Guest','Email','Amount','Method','Gateway','Date'].map(h => (
          <th key={h} style={styles.th}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {failed.map(p => (
          <tr key={p.payment_id} style={styles.tr}>
            <td style={styles.td}>{p.full_name}</td>
            <td style={styles.td}>{p.email}</td>
            <td style={styles.td}>${Number(p.amount).toFixed(2)}</td>
            <td style={styles.td}>{p.payment_method}</td>
            <td style={styles.td}>{p.payment_gateway || '—'}</td>
            <td style={styles.td}>{formatDate(p.initiated_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Manage Payments</h2>
      <div style={styles.tabs}>
        {['all', 'failed'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={tab === t ? styles.activeTab : styles.tab}>
            {t === 'all' ? 'All Payments' : 'Failed Payments'}
          </button>
        ))}
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {loading ? <Spinner /> :
        tab === 'all' ?
          payments.length === 0 ? <p style={styles.empty}>No payments found.</p> : renderAll() :
          failed.length === 0 ? <p style={styles.empty}>No failed payments.</p> : renderFailed()
      }
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'1100px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', marginBottom:'16px' },
  tabs: { display:'flex', gap:'8px', marginBottom:'20px' },
  tab: { padding:'8px 20px', border:'1px solid #ddd', borderRadius:'8px', background:'#fff', cursor:'pointer', fontSize:'14px' },
  activeTab: { padding:'8px 20px', border:'1px solid #1a1a2e', borderRadius:'8px', background:'#1a1a2e', color:'#fff', cursor:'pointer', fontSize:'14px' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  th: { background:'#1a1a2e', color:'#fff', padding:'12px 16px', textAlign:'left', fontSize:'13px' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'12px 16px', fontSize:'13px', color:'#333' },
  approveBtn: { padding:'4px 10px', background:'#28a745', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px', marginRight:'6px' },
  refundBtn: { padding:'4px 10px', background:'#e94560', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  empty: { color:'#666', textAlign:'center', padding:'40px' }
};

export default ManagePayments;