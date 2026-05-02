import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🏨 HotelBook</Link>
      <div style={styles.links}>
        {!isAuthenticated ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        ) : (
          <>
            <Link to="/hotels" style={styles.link}>Hotels</Link>

            {user?.role === ROLES.GUEST && (
              <>
                <Link to="/bookings" style={styles.link}>My Bookings</Link>
                <Link to="/payments" style={styles.link}>Payments</Link>
              </>
            )}

            {user?.role === ROLES.HOST && (
              <>
                <Link to="/bookings/history" style={styles.link}>Reservations</Link>
                <Link to="/payments" style={styles.link}>Payments</Link>
              </>
            )}

            {user?.role === ROLES.ADMIN && (
              <>
                <Link to="/admin" style={styles.link}>Admin</Link>
                <Link to="/bookings" style={styles.link}>Bookings</Link>
                <Link to="/payments" style={styles.link}>Payments</Link>
              </>
            )}

            <Link to="/profile" style={styles.link}>{user?.name || user?.full_name || 'Profile'}</Link>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 32px', background:'#1a1a2e', color:'#fff' },
  brand: { color:'#e94560', fontWeight:'bold', fontSize:'20px', textDecoration:'none' },
  links: { display:'flex', gap:'16px', alignItems:'center' },
  link: { color:'#ccc', textDecoration:'none', fontSize:'14px' },
  btn: { background:'#e94560', color:'#fff', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }
};

export default Navbar;