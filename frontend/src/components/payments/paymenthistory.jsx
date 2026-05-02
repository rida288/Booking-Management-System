import { useEffect } from 'react';
import { usePayment } from '../../hooks/usePayment';
import StatusBadge from '../shared/StatusBadge';
import Spinner from '../shared/Spinner';
import { formatDate } from '../../utils/formatedate';

const PaymentHistory = () => {
  const { payments, loading, error, fetchHistory } = usePayment();
  useEffect(() => { fetchHistory(); }, []);

  if (loading) return <Spinner />;
  if (error) return <div style={{ color:'red', padding:'20px' }}>{error}</div>;

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Payment History</h2>
      {payments.length === 0 ? <p>No payments found.</p> : (
        <table style={styles.table}>
          <thead>
            <tr>{['Hotel','Type','Amount','Method','Status','Date'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id} style={styles.tr}>
                <td style={styles.td}>{p.hotel_name}</td>
                <td style={styles.td}>{p.payment_type}</td>
                <td style={styles.td}>${Number(p.amount).toFixed(2)}</td>
                <td style={styles.td}>{p.payment_method}</td>
                <td style={styles.td}><StatusBadge status={p.status} /></td>
                <td style={styles.td}>{formatDate(p.initiated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'900px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', marginBottom:'20px' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  th: { background:'#1a1a2e', color:'#fff', padding:'12px 16px', textAlign:'left', fontSize:'13px' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'12px 16px', fontSize:'13px', color:'#333' }
};

export default PaymentHistory;