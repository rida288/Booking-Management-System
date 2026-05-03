import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../services/auth.service';

const Profile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone_number: user?.phone_number || '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(''); setError('');
    try {
      await updateProfile(form);
      login({ ...user, ...form }, localStorage.getItem('token'));
      setMsg('Profile updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.heading}>My Profile</h2>
        <div style={styles.badge}>{user?.role}</div>
        <p style={styles.email}>{user?.email}</p>
        {msg && <div style={styles.success}>{msg}</div>}
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} value={form.full_name}
            onChange={e => setForm({...form, full_name: e.target.value})} required />
          <label style={styles.label}>Phone Number</label>
          <input style={styles.input} value={form.phone_number}
            onChange={e => setForm({...form, phone_number: e.target.value})} />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'480px', margin:'60px auto', padding:'0 16px' },
  card: { background:'#fff', padding:'36px', borderRadius:'12px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' },
  heading: { fontSize:'22px', margin:'0 0 8px' },
  badge: { display:'inline-block', background:'#1a1a2e', color:'#fff', padding:'3px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'600', marginBottom:'8px' },
  email: { color:'#666', marginBottom:'20px', fontSize:'14px' },
  success: { background:'#d4edda', color:'#155724', padding:'10px', borderRadius:'6px', marginBottom:'14px', fontSize:'13px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'14px', fontSize:'13px' },
  label: { display:'block', marginBottom:'4px', fontWeight:'500', fontSize:'13px' },
  input: { width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'14px', fontSize:'14px', boxSizing:'border-box' },
  btn: { width:'100%', padding:'11px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', cursor:'pointer', fontWeight:'600' }
};

export default Profile;