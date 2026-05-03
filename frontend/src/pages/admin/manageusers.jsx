import { useEffect, useMemo, useState } from 'react';
import { changeUserRole, changeUserStatus, getAllUsers, searchUsers } from '../../services/user.service';
import Spinner from '../../components/shared/Spinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/formatedate';

const ROLE_FILTERS = ['ALL', ROLES.GUEST, ROLES.HOST, ROLES.ADMIN];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const keyword = search.trim();
      const res = keyword ? await searchUsers(keyword) : await getAllUsers();
      setUsers(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'ALL') return users;
    return users.filter((user) => user.role === roleFilter);
  }, [roleFilter, users]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleReset = async () => {
    setSearch('');
    setLoading(true);
    setError('');
    try {
      const res = await getAllUsers();
      setUsers(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user) => {
    const nextRole = prompt(`New role for ${user.email} (GUEST/HOST/ADMIN):`, user.role);
    const normalizedRole = nextRole?.trim().toUpperCase();
    if (!normalizedRole || !Object.values(ROLES).includes(normalizedRole) || normalizedRole === user.role) return;

    setUpdating(user.user_id);
    try {
      await changeUserRole(user.user_id, normalizedRole);
      setUsers((prev) => prev.map((item) =>
        item.user_id === user.user_id ? { ...item, role: normalizedRole } : item
      ));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = async (user) => {
    const nextStatus = !user.is_active;
    setUpdating(user.user_id);
    try {
      await changeUserStatus(user.user_id, nextStatus);
      setUsers((prev) => prev.map((item) =>
        item.user_id === user.user_id ? { ...item, is_active: nextStatus } : item
      ));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Manage Users</h2>
          <p style={styles.sub}>Review accounts, update roles, and activate or deactivate users.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} style={styles.toolbar}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          style={styles.search}
        />
        <button type="submit" style={styles.primaryBtn}>Search</button>
        <button type="button" onClick={handleReset} style={styles.secondaryBtn}>
          Reset
        </button>
      </form>

      <div style={styles.tabs}>
        {ROLE_FILTERS.map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            style={roleFilter === role ? styles.activeTab : styles.tab}
          >
            {role === 'ALL' ? 'All' : role}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? <div style={styles.error}>{error}</div> : (
        filteredUsers.length === 0 ? <p style={styles.empty}>No users found.</p> : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>{['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((label) => (
                  <th key={label} style={styles.th}>{label}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} style={styles.tr}>
                    <td style={styles.td}>{user.full_name}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.phone_number || '-'}</td>
                    <td style={styles.td}><StatusBadge status={user.role} /></td>
                    <td style={styles.td}>{user.is_active ? 'Active' : 'Inactive'}</td>
                    <td style={styles.td}>{formatDate(user.created_at)}</td>
                    <td style={styles.actions}>
                      <button
                        onClick={() => handleRoleChange(user)}
                        disabled={updating === user.user_id}
                        style={styles.actionBtn}
                      >
                        Role
                      </button>
                      <button
                        onClick={() => handleStatusChange(user)}
                        disabled={updating === user.user_id}
                        style={user.is_active ? styles.dangerBtn : styles.successBtn}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'1120px', margin:'0 auto', padding:'32px 16px' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'16px', marginBottom:'18px' },
  heading: { fontSize:'26px', margin:'0 0 4px' },
  sub: { margin:0, color:'#666', fontSize:'14px' },
  toolbar: { display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' },
  search: { minWidth:'260px', flex:'1 1 280px', padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px' },
  primaryBtn: { padding:'10px 16px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
  secondaryBtn: { padding:'10px 16px', background:'#fff', color:'#1a1a2e', border:'1px solid #ddd', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
  tabs: { display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' },
  tab: { padding:'8px 16px', border:'1px solid #ddd', borderRadius:'20px', background:'#fff', cursor:'pointer', fontSize:'13px' },
  activeTab: { padding:'8px 16px', border:'1px solid #e94560', borderRadius:'20px', background:'#e94560', color:'#fff', cursor:'pointer', fontSize:'13px' },
  tableWrap: { overflowX:'auto', background:'#fff', borderRadius:'8px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { background:'#1a1a2e', color:'#fff', padding:'12px 14px', textAlign:'left', fontSize:'12px', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'12px 14px', fontSize:'13px', color:'#333', whiteSpace:'nowrap' },
  actions: { padding:'12px 14px', display:'flex', gap:'6px', whiteSpace:'nowrap' },
  actionBtn: { padding:'6px 10px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  dangerBtn: { padding:'6px 10px', background:'#e94560', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  successBtn: { padding:'6px 10px', background:'#28a745', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', fontSize:'14px' },
  empty: { color:'#666', textAlign:'center', padding:'40px' }
};

export default ManageUsers;
