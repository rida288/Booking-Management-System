import { useEffect, useState } from "react";
import { getDefects, updateDefectStatus } from "../../services/defect.service";
import { useAuth } from "../../hooks/useAuth";

const DefectsPage = () => {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => { fetchDefects(); }, []);

  const fetchDefects = async () => {
    try {
      const res = await getDefects();
      setDefects(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load defects');
    } finally { setLoading(false); }
  };

  const handleStatusChange = async (defectId, status) => {
    try {
      await updateDefectStatus(defectId, status);
      fetchDefects();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <p style={{padding:'40px', textAlign:'center'}}>Loading...</p>;
  if (error) return <p style={{padding:'40px', color:'red'}}>{error}</p>;

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Active Defects</h2>
      {defects.length === 0 ? (
        <p style={styles.empty}>No active defects.</p>
      ) : defects.map(d => (
        <div key={d.defect_id} style={styles.card}>
          <div style={styles.header}>
            <div>
              <h3 style={styles.title}>{d.title}</h3>
              <p style={styles.meta}>Room: {d.room_type_id} · Reported: {new Date(d.reported_at).toLocaleDateString()}</p>
            </div>
            <div style={styles.right}>
              <span style={{...styles.badge, background: d.severity === 'CRITICAL' ? '#e94560' : d.severity === 'HIGH' ? '#ff6b35' : '#888'}}>
                {d.severity}
              </span>
              <span style={{...styles.badge, background: d.status === 'OPEN' ? '#dc3545' : '#ffc107', color: d.status === 'IN_PROGRESS' ? '#000' : '#fff'}}>
                {d.status}
              </span>
            </div>
          </div>
          {d.description && <p style={styles.desc}>{d.description}</p>}
          <div style={styles.actions}>
            {d.status === 'OPEN' && (
              <button style={styles.btn} onClick={() => handleStatusChange(d.defect_id, 'IN_PROGRESS')}>
                Mark In Progress
              </button>
            )}
            {d.status !== 'RESOLVED' && (
              <button style={{...styles.btn, background:'#28a745'}} onClick={() => handleStatusChange(d.defect_id, 'RESOLVED')}>
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'900px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', marginBottom:'20px' },
  empty: { color:'#666', textAlign:'center', padding:'40px' },
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' },
  title: { margin:'0 0 4px', fontSize:'16px', fontWeight:'700' },
  meta: { color:'#888', fontSize:'12px', margin:0 },
  right: { display:'flex', gap:'8px', flexShrink:0 },
  badge: { padding:'3px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'600', color:'#fff' },
  desc: { color:'#555', fontSize:'14px', margin:'8px 0' },
  actions: { display:'flex', gap:'8px', marginTop:'12px' },
  btn: { padding:'6px 14px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
};

export default DefectsPage;