const RoomCard = ({ room, onBook, selected }) => {
  return (
    <div style={{ ...styles.card, border: selected ? '2px solid #e94560' : '1px solid #e0e0e0' }}>
      <div style={styles.header}>
        <div>
          <h4 style={styles.name}>{room.type_name}</h4>
          <p style={styles.bed}>🛏 {room.bed_type}</p>
        </div>
        <div style={styles.price}>${room.base_price_per_night}<span style={styles.night}>/night</span></div>
      </div>
      {room.description && <p style={styles.desc}>{room.description}</p>}
      <div style={styles.details}>
        <span style={styles.badge}>👥 Max {room.max_occupancy} guests</span>
        <span style={styles.badge}>🏠 {room.total_rooms} rooms</span>
        {room.size_sqft && <span style={styles.badge}>📐 {room.size_sqft} sqft</span>}
        <span style={{ ...styles.badge, background: room.is_available ? '#d4edda' : '#f8d7da', color: room.is_available ? '#155724' : '#721c24' }}>
          {room.is_available ? '✅ Available' : '❌ Unavailable'}
        </span>
      </div>
      {room.is_available && (
        <button onClick={onBook} style={{ ...styles.btn, background: selected ? '#e94560' : '#1a1a2e' }}>
          {selected ? 'Selected ✓' : 'Book Now'}
        </button>
      )}
    </div>
  );
};

const styles = {
  card: { background:'#fff', borderRadius:'12px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' },
  name: { margin:'0 0 4px', fontSize:'18px', fontWeight:'700', color:'#1a1a2e' },
  bed: { color:'#666', margin:0, fontSize:'13px' },
  price: { fontSize:'22px', fontWeight:'700', color:'#e94560' },
  night: { fontSize:'13px', fontWeight:'400', color:'#888' },
  desc: { color:'#666', fontSize:'13px', marginBottom:'12px', lineHeight:'1.5' },
  details: { display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'16px' },
  badge: { padding:'4px 10px', background:'#f0f2f5', borderRadius:'20px', fontSize:'12px', color:'#555' },
  btn: { width:'100%', padding:'10px', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }
};

export default RoomCard;