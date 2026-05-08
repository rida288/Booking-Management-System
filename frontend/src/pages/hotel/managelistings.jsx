import { useEffect, useState } from 'react';
import { getMyHotels, createHotel, deleteHotel } from '../../services/hotel.service';
import { getRoomsByHotel, createRoom } from '../../services/room.service';
import { getHotelAmenities, getAllAmenities, addHotelAmenity, removeHotelAmenity } from '../../services/amenities.service';
import { getDefects } from '../../services/defect.service';
import Spinner from '../../components/shared/Spinner';

const ManageListings = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [rooms, setRooms] = useState({});
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [hotelAmenities, setHotelAmenities] = useState({});
  const [allAmenities, setAllAmenities] = useState([]);
  const [showAmenityPanel, setShowAmenityPanel] = useState(null);
  const [defects, setDefects] = useState({});           // NEW
  const [expandedRoom, setExpandedRoom] = useState(null); // NEW

  const [hotelForm, setHotelForm] = useState({
    name:'', city:'', country:'', description:'', address:'',
    province:'', star_rating:'', check_in_time:'14:00', check_out_time:'11:00',
    cancellation_policy:''
  });

  const [roomForm, setRoomForm] = useState({
    type_name:'', description:'', max_occupancy:1, total_rooms:1,
    base_price_per_night:'', size_sqft:'', bed_type:''
  });

  useEffect(() => {
    loadHotels();
    loadAllAmenities();
  }, []);

  const loadHotels = async () => {
    try {
      const res = await getMyHotels();
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

  // NEW
  const loadDefects = async (roomTypeId) => {
    if (defects[roomTypeId]) return;
    try {
      const res = await getDefects();
      const all = res.data?.data || [];
      const filtered = all.filter(d => d.room_type_id === roomTypeId);
      setDefects(prev => ({ ...prev, [roomTypeId]: filtered }));
    } catch (e) { console.error(e); }
  };

  // NEW
  const toggleRoom = async (roomTypeId) => {
    if (expandedRoom === roomTypeId) {
      setExpandedRoom(null);
    } else {
      setExpandedRoom(roomTypeId);
      await loadDefects(roomTypeId);
    }
  };

  const toggleHotel = async (hotelId) => {
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
    } else {
      setExpandedHotel(hotelId);
      await Promise.all([loadRooms(hotelId), loadHotelAmenities(hotelId)]);
    }
  };

  const handleCreateHotel = async () => {
    try {
      await createHotel({
        ...hotelForm,
        check_in_time: hotelForm.check_in_time + ':00',
        check_out_time: hotelForm.check_out_time + ':00',
      });
      setShowHotelForm(false);
      setHotelForm({ name:'', city:'', country:'', description:'', address:'', province:'', star_rating:'', check_in_time:'14:00', check_out_time:'11:00', cancellation_policy:'' });
      await loadHotels();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create hotel');
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!confirm('Delete this hotel? This will also delete all rooms and bookings.')) return;
    setDeleting(hotelId);
    try {
      await deleteHotel(hotelId);
      setHotels(prev => prev.filter(h => h.hotel_id !== hotelId));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete hotel');
    } finally { setDeleting(null); }
  };

  const handleCreateRoom = async (hotelId) => {
    try {
      await createRoom({ ...roomForm, hotelId });
      setShowRoomForm(null);
      setRoomForm({ type_name:'', description:'', max_occupancy:1, total_rooms:1, base_price_per_night:'', size_sqft:'', bed_type:'' });
      setRooms(prev => ({ ...prev, [hotelId]: null }));
      await loadRooms(hotelId);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create room');
    }
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

  if (loading) return <Spinner />;

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <h2 style={styles.heading}>My Listings</h2>
        <button onClick={() => setShowHotelForm(!showHotelForm)} style={styles.addBtn}>
          {showHotelForm ? 'Cancel' : '+ Add Hotel'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showHotelForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>New Hotel</h3>
          <div style={styles.formGrid}>
            {[
              ['name', 'Hotel Name', 'text'],
              ['city', 'City', 'text'],
              ['country', 'Country', 'text'],
              ['province', 'Province', 'text'],
              ['address', 'Address', 'text'],
              ['star_rating', 'Star Rating (1-5)', 'number'],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label style={styles.label}>{label}</label>
                <input style={styles.input} type={type} value={hotelForm[key]}
                  onChange={e => setHotelForm({...hotelForm, [key]: e.target.value})} />
              </div>
            ))}
          </div>
          <label style={styles.label}>Description</label>
          <textarea style={styles.textarea} rows={3} value={hotelForm.description}
            onChange={e => setHotelForm({...hotelForm, description: e.target.value})} />
          <label style={styles.label}>Cancellation Policy</label>
          <textarea style={styles.textarea} rows={2} value={hotelForm.cancellation_policy}
            onChange={e => setHotelForm({...hotelForm, cancellation_policy: e.target.value})} />
          <button onClick={handleCreateHotel} style={styles.submitBtn}>Create Hotel</button>
        </div>
      )}

      {hotels.length === 0 ? (
        <p style={styles.empty}>You have no hotels yet. Add one above.</p>
      ) : (
        hotels.map(hotel => (
          <div key={hotel.hotel_id} style={styles.hotelCard}>
            <div style={styles.hotelHeader}>
              <div>
                <h3 style={styles.hotelName}>{hotel.name}</h3>
                <p style={styles.hotelMeta}>📍 {hotel.city}, {hotel.country} · {'⭐'.repeat(hotel.star_rating || 0)} · {hotel.total_room_types} room type(s)</p>
              </div>
              <div style={styles.hotelActions}>
                <button onClick={() => toggleHotel(hotel.hotel_id)} style={styles.expandBtn}>
                  {expandedHotel === hotel.hotel_id ? 'Hide ▲' : 'Manage ▼'}
                </button>
                <button onClick={() => handleDeleteHotel(hotel.hotel_id)}
                  disabled={deleting === hotel.hotel_id} style={styles.deleteBtn}>
                  {deleting === hotel.hotel_id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {expandedHotel === hotel.hotel_id && (
              <div style={styles.roomsSection}>

                {/* AMENITIES */}
                <div style={styles.sectionBlock}>
                  <div style={styles.roomsHeader}>
                    <h4 style={styles.roomsTitle}>Hotel Amenities</h4>
                    <button onClick={() => setShowAmenityPanel(showAmenityPanel === hotel.hotel_id ? null : hotel.hotel_id)}
                      style={styles.addRoomBtn}>
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
                    <div style={styles.amenityPanel}>
                      <p style={styles.panelLabel}>Select amenities to add:</p>
                      <div style={styles.amenitiesGrid}>
                        {allAmenities
                          .filter(a => !(hotelAmenities[hotel.hotel_id] || []).find(ha => ha.amenity_id === a.amenity_id))
                          .map(a => (
                            <button key={a.amenity_id} onClick={() => handleAddAmenity(hotel.hotel_id, a.amenity_id)}
                              style={styles.addAmenityBtn}>+ {a.name}</button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ROOMS */}
                <div style={styles.sectionBlock}>
                  <div style={styles.roomsHeader}>
                    <h4 style={styles.roomsTitle}>Room Types</h4>
                    <button onClick={() => setShowRoomForm(showRoomForm === hotel.hotel_id ? null : hotel.hotel_id)}
                      style={styles.addRoomBtn}>
                      {showRoomForm === hotel.hotel_id ? 'Cancel' : '+ Add Room Type'}
                    </button>
                  </div>

                  {showRoomForm === hotel.hotel_id && (
                    <div style={styles.roomFormCard}>
                      <div style={styles.formGrid}>
                        {[
                          ['type_name', 'Room Type Name', 'text'],
                          ['bed_type', 'Bed Type', 'text'],
                          ['max_occupancy', 'Max Occupancy', 'number'],
                          ['total_rooms', 'Total Rooms', 'number'],
                          ['base_price_per_night', 'Price/Night ($)', 'number'],
                          ['size_sqft', 'Size (sqft)', 'number'],
                        ].map(([key, label, type]) => (
                          <div key={key}>
                            <label style={styles.label}>{label}</label>
                            <input style={styles.input} type={type} value={roomForm[key]}
                              onChange={e => setRoomForm({...roomForm, [key]: e.target.value})} />
                          </div>
                        ))}
                      </div>
                      <label style={styles.label}>Description</label>
                      <textarea style={styles.textarea} rows={2} value={roomForm.description}
                        onChange={e => setRoomForm({...roomForm, description: e.target.value})} />
                      <button onClick={() => handleCreateRoom(hotel.hotel_id)} style={styles.submitBtn}>
                        Add Room Type
                      </button>
                    </div>
                  )}

                  {rooms[hotel.hotel_id]?.length === 0 ? (
                    <p style={styles.empty}>No room types yet.</p>
                  ) : (
                    <>
                      <table style={styles.table}>
                        <thead>
                          <tr>{['Type', 'Bed', 'Max Guests', 'Rooms', 'Price/Night', 'Size', 'Available', 'Defects'].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {rooms[hotel.hotel_id]?.map(room => (
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

                      {/* DEFECTS PANEL */}
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
                    </>
                  )}
                </div>
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
  topRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  heading: { fontSize:'24px', fontWeight:'700', color:'#1a1a2e', margin:0 },
  addBtn: { padding:'10px 20px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600' },
  error: { background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'6px', marginBottom:'16px' },
  formCard: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'24px', marginBottom:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  formTitle: { fontSize:'18px', fontWeight:'700', marginBottom:'16px', color:'#1a1a2e' },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' },
  label: { display:'block', fontSize:'12px', fontWeight:'600', color:'#888', marginBottom:'4px', textTransform:'uppercase' },
  input: { width:'100%', padding:'9px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box' },
  textarea: { width:'100%', padding:'9px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box', resize:'vertical', marginBottom:'12px' },
  submitBtn: { padding:'10px 24px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600', marginTop:'8px' },
  empty: { color:'#888', textAlign:'center', padding:'30px' },
  hotelCard: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'20px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  hotelHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  hotelName: { margin:'0 0 4px', fontSize:'18px', fontWeight:'700', color:'#1a1a2e' },
  hotelMeta: { color:'#888', margin:0, fontSize:'13px' },
  hotelActions: { display:'flex', gap:'8px' },
  expandBtn: { padding:'7px 14px', background:'#f0f2f5', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  deleteBtn: { padding:'7px 14px', background:'#e94560', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  roomsSection: { marginTop:'16px', paddingTop:'16px', borderTop:'1px solid #f0f0f0' },
  sectionBlock: { marginBottom:'20px' },
  roomsHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' },
  roomsTitle: { margin:0, fontSize:'15px', fontWeight:'600', color:'#1a1a2e' },
  addRoomBtn: { padding:'6px 14px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  roomFormCard: { background:'#f8f9fa', borderRadius:'8px', padding:'16px', marginBottom:'16px' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { background:'#f8f9fa', padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#888', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'10px 12px', fontSize:'13px', color:'#333' },
  amenitiesGrid: { display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'12px' },
  amenityTag: { padding:'5px 10px', background:'#f0f4ff', border:'1px solid #c0d0ff', borderRadius:'20px', fontSize:'13px', color:'#1a1a2e', display:'flex', alignItems:'center', gap:'6px' },
  removeAmenityBtn: { background:'none', border:'none', color:'#e94560', cursor:'pointer', fontSize:'16px', lineHeight:1, padding:0, fontWeight:'700' },
  amenityPanel: { background:'#f8f9fa', borderRadius:'8px', padding:'14px', marginBottom:'12px' },
  panelLabel: { fontSize:'12px', fontWeight:'600', color:'#888', textTransform:'uppercase', marginBottom:'10px' },
  addAmenityBtn: { padding:'5px 12px', background:'#fff', border:'1px solid #1a1a2e', borderRadius:'20px', fontSize:'13px', color:'#1a1a2e', cursor:'pointer' },
  // NEW defect styles
  defectsPanel: { marginTop:'12px', background:'#f8f9fa', borderRadius:'8px', padding:'16px' },
  defectRow: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 0', borderBottom:'1px solid #eee' },
  defectLeft: { flex:1 },
  defectDesc: { color:'#666', fontSize:'12px', margin:'4px 0 0' },
  defectRight: { display:'flex', gap:'6px', flexShrink:0 },
  badge: { padding:'3px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'600', color:'#fff' },
};

export default ManageListings;