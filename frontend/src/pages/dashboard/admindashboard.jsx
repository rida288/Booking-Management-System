import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../services/dashboard.service';
import Spinner from '../../components/shared/Spinner';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#1a1a2e', '#e94560', '#28a745', '#ffc107', '#17a2b8'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then(res => setData(res.data?.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding:'40px', color:'red' }}>{error}</div>;
  if (!data) return null;

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Admin Dashboard</h2>

      {/* Stat Cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Revenue</div>
          <div style={styles.cardVal}>${Number(data.totalRevenue?.total_revenue || 0).toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Revenue This Month</div>
          <div style={styles.cardVal}>${Number(data.revenueThisMonth?.revenue_this_month || 0).toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Pending Payments</div>
          <div style={{ ...styles.cardVal, color:'#ffc107' }}>{data.paymentStats?.pending_payments || 0}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Pending Refunds</div>
          <div style={{ ...styles.cardVal, color:'#e94560' }}>{data.paymentStats?.pending_refunds || 0}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Failed Payments</div>
          <div style={{ ...styles.cardVal, color:'#dc3545' }}>{data.paymentStats?.failed_payments || 0}</div>
        </div>
      </div>

      <div style={styles.row}>
        {/* Revenue by Month */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Revenue Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={val => `$${Number(val).toLocaleString()}`} />
              <Line type="monotone" dataKey="revenue" stroke="#e94560" strokeWidth={2} dot={{ r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Status */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.bookingsByStatus} dataKey="total" nameKey="status"
                cx="50%" cy="50%" outerRadius={90} label={({ status, total }) => `${status}: ${total}`}>
                {data.bookingsByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Hotels */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Top Hotels by Revenue</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.topHotels}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hotel_name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={val => `$${Number(val).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="total_revenue" fill="#1a1a2e" name="Revenue" />
            <Bar dataKey="total_bookings" fill="#e94560" name="Bookings" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'1100px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', marginBottom:'24px' },
  cards: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'16px', marginBottom:'24px' },
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  cardLabel: { color:'#888', fontSize:'12px', fontWeight:'600', textTransform:'uppercase', marginBottom:'8px' },
  cardVal: { fontSize:'24px', fontWeight:'700', color:'#1a1a2e' },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' },
  chartCard: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'24px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  chartTitle: { fontSize:'16px', fontWeight:'600', marginBottom:'16px', color:'#1a1a2e' }
};

export default AdminDashboard;