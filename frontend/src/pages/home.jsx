import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div style={styles.hero}>
      <div style={styles.content}>
        <h1 style={styles.heading}>Find Your Perfect Stay 🏨</h1>
        <p style={styles.sub}>Book hotels, manage reservations, and enjoy seamless travel experiences.</p>
        <div style={styles.actions}>
          <Link to="/hotels" style={styles.primaryBtn}>Browse Hotels</Link>
          {!isAuthenticated && <Link to="/register" style={styles.secondaryBtn}>Get Started</Link>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  hero: { minHeight:'calc(100vh - 60px)', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)' },
  content: { textAlign:'center', color:'#fff', padding:'32px' },
  heading: { fontSize:'48px', fontWeight:'800', marginBottom:'16px' },
  sub: { fontSize:'18px', color:'#ccc', marginBottom:'32px', maxWidth:'500px', margin:'0 auto 32px' },
  actions: { display:'flex', gap:'16px', justifyContent:'center' },
  primaryBtn: { padding:'14px 32px', background:'#e94560', color:'#fff', borderRadius:'10px', textDecoration:'none', fontSize:'16px', fontWeight:'700' },
  secondaryBtn: { padding:'14px 32px', border:'2px solid #fff', color:'#fff', borderRadius:'10px', textDecoration:'none', fontSize:'16px', fontWeight:'700' }
};

export default Home;