import { useEffect, useState } from 'react';
import { getHotels, deleteHotel } from '../../services/hotel.service';
import { getRoomsByHotel } from '../../services/room.service';
import Spinner from '../../components/shared/Spinner';
import { getDefects } from '../../services/defect.service';
import { getHotelAmenities, getAllAmenities, addHotelAmenity, removeHotelAmenity } from '../../services/amenities.service';

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [rooms, setRooms] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [defects, setDefects] = useState({});
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [hotelAmenities, setHotelAmenities] = useState({});
  const [allAmenities, setAllAmenities] = useState([]);
  const [showAmenityPanel, setShowAmenityPanel] = useState(null);

  useEffect(() => { loadHotels(); loadAllAmenities();}, []);

  const loadAllAmenities = async () => {
    try {
      const res = await getAllAmenities();
      setAllAmenities(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  const loadHotelAmenities = async (hotelId) => {
    try {
      const res = await getHotelAmenities(hotelId);
      setHotelAmenities(prev => ({ ...prev, [hotelId]: res.data?.data || [] }));
    } catch (e) { console.error(e); }
  };

  const handleAddAmenity = async (hotelId, amenityId) => {
    try {
      await addHotelAmenity(hotelId, amenityId);
      await loadHotelAmenities(hotelId);
    } catch (e) { alert(e.response?.data?.message || 'Failed to add amenity'); }
  };

  const handleRemoveAmenity = async (hotelId, amenityId) => {
    try {
      await removeHotelAmenity(hotelId, amenityId);
      setHotelAmenities(prev => ({ ...prev, [hotelId]: prev[hotelId].filter(a => a.amenity_id !== amenityId) }));
    } catch (e) { alert(e.response?.data?.message || 'Failed to remove amenity'); }
  };

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

  const loadDefects = async (roomTypeId) => {
    if (defects[roomTypeId]) return;
    try {
      const res = await getDefects();
      const all = res.data?.data || [];
      const filtered = all.filter(d => d.room_type_id === roomTypeId);
      setDefects(prev => ({ ...prev, [roomTypeId]: filtered }));
    } catch (e) { console.error(e); }
  };

  const toggleRoom = async (roomTypeId) => {
    if (expandedRoom === roomTypeId) {
      setExpandedRoom(null);
    } else {
      setExpandedRoom(roomTypeId);
      await loadDefects(roomTypeId);
      await Promise.all([loadRooms(hotelId), loadHotelAmenities(hotelId)]);
    }
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
                        <tr>{['Type','Bed','Max Guests','Rooms','Price/Night','Size','Available','Defects'].map(h => (
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
                            <td style={styles.td}>
                              <button onClick={() => toggleRoom(room.room_type_id)} style={styles.expandBtn}>
                                {expandedRoom === room.room_type_id ? 'Hide ▲' : 'View ▼'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }
                <div style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <h4 style={styles.roomsTitle}>Hotel Amenities</h4>
                  <button onClick={() => setShowAmenityPanel(showAmenityPanel === hotel.hotel_id ? null : hotel.hotel_id)}
                    style={styles.expandBtn}>
                    {showAmenityPanel === hotel.hotel_id ? 'Cancel' : '+ Add Amenity'}
                  </button>
                </div>
                <div style={styles.amenitiesGrid}>
                  {(hotelAmenities[hotel.hotel_id] || []).length === 0 ? (
                    <p style={{ color:'#888', fontSize:'13px' }}>No amenities added yet.</p>
                  ) : (
                    hotelAmenities[hotel.hotel_id].map(a => (
                      <span key={a.amenity_id} style={styles.amenityTag}>
                        {a.name}
                        <button onClick={() => handleRemoveAmenity(hotel.hotel_id, a.amenity_id)} style={styles.removeAmenityBtn}>×</button>
                      </span>
                    ))
                  )}
                  </div>
                  {showAmenityPanel === hotel.hotel_id && (
                    <div style={{ background:'#f8f9fa', borderRadius:'8px', padding:'12px', marginTop:'8px' }}>
                      <p style={{ fontSize:'12px', fontWeight:'600', color:'#888', textTransform:'uppercase', marginBottom:'8px' }}>Select to add:</p>
                      <div style={styles.amenitiesGrid}>
                        {allAmenities
                          .filter(a => !(hotelAmenities[hotel.hotel_id] || []).find(ha => ha.amenity_id === a.amenity_id))
                          .map(a => (
                            <button key={a.amenity_id} onClick={() => handleAddAmenity(hotel.hotel_id, a.amenity_id)}
                              style={{ padding:'5px 12px', background:'#fff', border:'1px solid #1a1a2e', borderRadius:'20px', fontSize:'13px', color:'#1a1a2e', cursor:'pointer' }}>
                              + {a.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                {expandedRoom && rooms[hotel.hotel_id]?.find(r => r.room_type_id === expandedRoom) && (
                  <div style={styles.defectsPanel}>
                    <h4 style={styles.roomsTitle}>
                      Defects — {rooms[hotel.hotel_id].find(r => r.room_type_id === expandedRoom)?.type_name}
                    </h4>
                    {!defects[expandedRoom] ? <p>Loading...</p> :
                      defects[expandedRoom].length === 0 ? <p style={styles.empty}>No active defects.</p> : (
                        defects[expandedRoom].map(d => (
                          <div key={d.defect_id} style={styles.defectRow}>
                            <div style={styles.defectLeft}>
                              <strong>{d.title}</strong>
                              {d.description && <p style={styles.defectDesc}>{d.description}</p>}
                            </div>
                            <div style={styles.defectRight}>
                              <span style={{...styles.badge, background: d.severity === 'CRITICAL' ? '#e94560' : d.severity === 'HIGH' ? '#ff6b35' : '#888'}}>
                                {d.severity}
                              </span>
                              <span style={{...styles.badge, background: d.status === 'OPEN' ? '#dc3545' : '#ffc107', color: d.status === 'IN_PROGRESS' ? '#000' : '#fff'}}>
                                {d.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )
                    }
                  </div>
                )}
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
  td: { padding:'10px 12px', fontSize:'13px', color:'#333' },
  defectsPanel: { marginTop:'12px', background:'#f8f9fa', borderRadius:'8px', padding:'16px' },
  defectRow: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 0', borderBottom:'1px solid #eee' },
  defectLeft: { flex:1 },
  defectDesc: { color:'#666', fontSize:'12px', margin:'4px 0 0' },
  defectRight: { display:'flex', gap:'6px', flexShrink:0 },
  badge: { padding:'3px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'600', color:'#fff' },
  amenitiesGrid: { display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'8px' },
  amenityTag: { padding:'5px 10px', background:'#f0f4ff', border:'1px solid #c0d0ff', borderRadius:'20px', fontSize:'13px', color:'#1a1a2e', display:'flex', alignItems:'center', gap:'6px' },
  removeAmenityBtn: { background:'none', border:'none', color:'#e94560', cursor:'pointer', fontSize:'16px', lineHeight:1, padding:0, fontWeight:'700' },
};

export default ManageHotels;