import { Link } from "react-router-dom";

const STAR = '⭐';

const HotelCard = ({ hotel }) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.stars}>{STAR.repeat(hotel.star_rating || 0)}</div>
      </div>
      <div style={styles.body}>
        <h3 style={styles.name}>{hotel.name}</h3>
        <p style={styles.location}>📍 {hotel.city}, {hotel.country}</p>
        {hotel.description && (
          <p style={styles.desc}>{hotel.description.slice(0, 100)}...</p>
        )}
      </div>
      <div style={styles.footer}>
        <Link to={`/hotels/${hotel.hotel_id}`} style={styles.btn}>
          View Details
        </Link>
      </div>
    </div>
  );
};

const styles = {
  card: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', justifyContent:'space-between' },
  header: { background:'#1a1a2e', padding:'20px', minHeight:'60px' },
  stars: { fontSize:'14px' },
  body: { padding:'16px' },
  name: { margin:'0 0 6px', fontSize:'18px', fontWeight:'700', color:'#1a1a2e' },
  location: { color:'#666', fontSize:'13px', margin:'0 0 10px' },
  desc: { color:'#888', fontSize:'13px', margin:0, lineHeight:'1.5' },
  footer: { padding:'16px', borderTop:'1px solid #f0f0f0' },
  btn: { display:'block', textAlign:'center', padding:'10px', background:'#e94560', color:'#fff', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'600' }
};

export default HotelCard;