import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { login as loginService } from '../../services/auth.service';

const LoginForm = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginService(form);
      const { user, token } = res.data.data;
      login(user, token);
      navigate('/hotels');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 🏨</h2>
        <p style={styles.sub}>Sign in to your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.footer}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f2f5' },
  card: { background:'#fff', padding:'40px', borderRadius:'12px', width:'100%', maxWidth:'400px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' },
  title: { margin:'0 0 4px', fontSize:'24px' },
  sub: { color:'#666', margin:'0 0 24px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  label: { display:'block', marginBottom:'4px', fontWeight:'500', fontSize:'14px' },
  input: { width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'16px', fontSize:'14px', boxSizing:'border-box' },
  btn: { width:'100%', padding:'12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', fontWeight:'600' },
  footer: { textAlign:'center', marginTop:'16px', fontSize:'14px' }
};

export default LoginForm;