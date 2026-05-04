import { useEffect, useState } from 'react';
import { getHotels, deleteHotel } from '../../services/hotel.service';
import { getRoomsByHotel } from '../../services/room.service';
import Spinner from '../../components/shared/Spinner';

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [rooms, setRooms] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadHotels(); }, []);

  const loadHotels = async (q = '') => {
    try {
      const res = await getHotels({ searchQuery: q });
      setHotels(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load hotels');
    } finally { setLoading(false); }
  };

  const loadRooms = async (hotelId) => {
    if (rooms[hotelId]) return;
    try {
      const res = await getRoomsByHotel(hotelId);
      setRooms(prev => ({ ...prev, [hotelId]: res.data?.data || [] }));
    } catch (e) { console.error(e); }
  };

  const toggleHotel = async (hotelId) => {
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
    } else {
      setExpandedHotel(hotelId);
      await loadRooms(hotelId);
    }
  };

  const handleDelete = async (hotelId) => {
    if (!confirm('Delete this hotel? This will also delete all rooms and bookings.')) return;
    setDeleting(hotelId);
    try {
      await deleteHotel(hotelId);
      setHotels(prev => prev.filter(h => h.hotel_id !== hotelId));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete hotel');
    } finally { setDeleting(null); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Manage Hotels</h2>

      <div style={styles.searchRow}>
        <input style={styles.input} placeholder="Search hotels..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadHotels(search)} />
        <button style={styles.searchBtn} onClick={() => loadHotels(search)}>Search</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {hotels.length === 0 ? <p style={styles.empty}>No hotels found.</p> : (
        hotels.map(hotel => (
          <div key={hotel.hotel_id} style={styles.hotelCard}>
            <div style={styles.hotelHeader}>
              <div>
                <h3 style={styles.hotelName}>{hotel.name}</h3>
                <p style={styles.hotelMeta}>📍 {hotel.city}, {hotel.country} · {'⭐'.repeat(hotel.star_rating || 0)}</p>
                <p style={styles.hotelMeta}>{hotel.description}</p>
              </div>
              <div style={styles.actions}>
                <button onClick={() => toggleHotel(hotel.hotel_id)} style={styles.expandBtn}>
                  {expandedHotel === hotel.hotel_id ? 'Hide Rooms ▲' : 'View Rooms ▼'}
                </button>
                <button onClick={() => handleDelete(hotel.hotel_id)}
                  disabled={deleting === hotel.hotel_id} style={styles.deleteBtn}>
                  {deleting === hotel.hotel_id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {expandedHotel === hotel.hotel_id && (
              <div style={styles.roomsSection}>
                <h4 style={styles.roomsTitle}>Room Types</h4>
                {!rooms[hotel.hotel_id] ? <p>Loading...</p> :
                  rooms[hotel.hotel_id].length === 0 ? <p style={styles.empty}>No rooms.</p> : (
                    <table style={styles.table}>
                      <thead>
                        <tr>{['Type','Bed','Max Guests','Rooms','Price/Night','Size','Available'].map(h => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {rooms[hotel.hotel_id].map(room => (
                          <tr key={room.room_type_id} style={styles.tr}>
                            <td style={styles.td}>{room.type_name}</td>
                            <td style={styles.td}>{room.bed_type}</td>
                            <td style={styles.td}>{room.max_occupancy}</td>
                            <td style={styles.td}>{room.total_rooms}</td>
                            <td style={styles.td}>${room.base_price_per_night}</td>
                            <td style={styles.td}>{room.size_sqft} sqft</td>
                            <td style={styles.td}>{room.is_available ? '✅' : '❌'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'1000px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'24px', fontWeight:'700', color:'#1a1a2e', marginBottom:'20px' },
  searchRow: { display:'flex', gap:'10px', marginBottom:'20px' },
  input: { flex:1, padding:'10px 14px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px' },
  searchBtn: { padding:'10px 20px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px' },
  empty: { color:'#888', textAlign:'center', padding:'30px' },
  hotelCard: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  hotelHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  hotelName: { margin:'0 0 4px', fontSize:'18px', fontWeight:'700', color:'#1a1a2e' },
  hotelMeta: { color:'#888', margin:'0 0 4px', fontSize:'13px' },
  actions: { display:'flex', gap:'8px' },
  expandBtn: { padding:'7px 14px', background:'#f0f2f5', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  deleteBtn: { padding:'7px 14px', background:'#e94560', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  roomsSection: { marginTop:'16px', paddingTop:'16px', borderTop:'1px solid #f0f0f0' },
  roomsTitle: { margin:'0 0 12px', fontSize:'15px', fontWeight:'600', color:'#1a1a2e' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { background:'#f8f9fa', padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#888', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'10px 12px', fontSize:'13px', color:'#333' }
};

export default ManageHotels;