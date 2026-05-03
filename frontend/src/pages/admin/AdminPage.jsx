import { useState, useEffect } from 'react';
import { getAllUsers, changeUserRole, changeUserStatus } from '../../services/user.service';
import Spinner from '../../components/shared/Spinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { formatDate } from '../../utils/formatedate';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('GUEST');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(roleFilter);
      setUsers(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch users');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleRoleChange = async (email, role) => {
    const newRole = prompt(`New role for ${email} (GUEST/HOST/ADMIN):`, role);
    if (!newRole || !['GUEST','HOST','ADMIN'].includes(newRole.toUpperCase())) return;
    await changeUserRole(email, newRole.toUpperCase());
    fetchUsers();
  };

  const handleStatusChange = async (email, isActive) => {
    await changeUserStatus(email, isActive ? 0 : 1);
    fetchUsers();
  };

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Admin Panel — Users</h2>
      <div style={styles.tabs}>
        {['GUEST','HOST','ADMIN'].map(r => (
          <button key={r} style={roleFilter === r ? styles.activeTab : styles.tab}
            onClick={() => setRoleFilter(r)}>{r}s</button>
        ))}
      </div>
      {loading ? <Spinner /> : error ? <div style={styles.error}>{error}</div> : (
        <table style={styles.table}>
          <thead>
            <tr>{['Name','Email','Phone','Role','Active','Joined','Actions'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id} style={styles.tr}>
                <td style={styles.td}>{u.full_name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.phone_number || '-'}</td>
                <td style={styles.td}><StatusBadge status={u.role} /></td>
                <td style={styles.td}>{u.is_active ? '✅' : '❌'}</td>
                <td style={styles.td}>{formatDate(u.created_at)}</td>
                <td style={styles.td}>
                  <button style={styles.actionBtn} onClick={() => handleRoleChange(u.email, u.role)}>Role</button>
                  <button style={{...styles.actionBtn, background: u.is_active ? '#e94560':'#28a745'}}
                    onClick={() => handleStatusChange(u.email, u.is_active)}>
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'1100px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'26px', marginBottom:'16px' },
  tabs: { display:'flex', gap:'8px', marginBottom:'20px' },
  tab: { padding:'8px 20px', border:'1px solid #ddd', borderRadius:'20px', background:'#fff', cursor:'pointer', fontSize:'13px' },
  activeTab: { padding:'8px 20px', border:'1px solid #1a1a2e', borderRadius:'20px', background:'#1a1a2e', color:'#fff', cursor:'pointer', fontSize:'13px' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  th: { background:'#1a1a2e', color:'#fff', padding:'12px 14px', textAlign:'left', fontSize:'12px', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'12px 14px', fontSize:'13px' },
  actionBtn: { marginRight:'6px', padding:'4px 10px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  error: { color:'red', padding:'20px' }
};

export default AdminPage;