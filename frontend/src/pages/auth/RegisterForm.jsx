import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerService } from '../../services/auth.service';

const RegisterForm = () => {
  const [form, setForm] = useState({ email:'', password:'', fullName:'', phone:'', role:'GUEST' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerService(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (field) => (e) => setForm({...form, [field]: e.target.value});

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['Full Name','text','fullName'],['Email','email','email'],['Phone','tel','phone'],['Password','password','password']].map(([lbl,type,key]) => (
            <div key={key}>
              <label style={styles.label}>{lbl}</label>
              <input style={styles.input} type={type} value={form[key]} onChange={f(key)} required={key !== 'phone'} />
            </div>
          ))}
          <label style={styles.label}>Role</label>
          <select style={styles.input} value={form.role} onChange={f('role')}>
            <option value="GUEST">Guest</option>
            <option value="HOST">Host</option>
          </select>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.footer}>Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f2f5' },
  card: { background:'#fff', padding:'40px', borderRadius:'12px', width:'100%', maxWidth:'420px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' },
  title: { margin:'0 0 20px', fontSize:'24px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
  label: { display:'block', marginBottom:'4px', fontWeight:'500', fontSize:'14px' },
  input: { width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'14px', fontSize:'14px', boxSizing:'border-box' },
  btn: { width:'100%', padding:'12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', fontWeight:'600' },
  footer: { textAlign:'center', marginTop:'16px', fontSize:'14px' }
};

export default RegisterForm;