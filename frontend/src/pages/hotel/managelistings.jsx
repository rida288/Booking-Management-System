import { useEffect, useState } from 'react';
import { getMyHotels, createHotel, deleteHotel } from '../../services/hotel.service';
import { getRoomsByHotel, createRoom } from '../../services/room.service';
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

  const [hotelForm, setHotelForm] = useState({
    name:'', city:'', country:'', description:'', address:'',
    province:'', star_rating:'', check_in_time:'14:00:00', check_out_time:'11:00:00',
    cancellation_policy:''
  });

  const [roomForm, setRoomForm] = useState({
    type_name:'', description:'', max_occupancy:1, total_rooms:1,
    base_price_per_night:'', size_sqft:'', bed_type:''
  });

  useEffect(() => {
    loadHotels();
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

  const toggleHotel = async (hotelId) => {
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
    } else {
      setExpandedHotel(hotelId);
      await loadRooms(hotelId);
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
                  {expandedHotel === hotel.hotel_id ? 'Hide Rooms ▲' : 'Manage Rooms ▼'}
                </button>
                <button onClick={() => handleDeleteHotel(hotel.hotel_id)}
                  disabled={deleting === hotel.hotel_id} style={styles.deleteBtn}>
                  {deleting === hotel.hotel_id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {expandedHotel === hotel.hotel_id && (
              <div style={styles.roomsSection}>
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
                  <table style={styles.table}>
                    <thead>
                      <tr>{['Type', 'Bed', 'Max Guests', 'Rooms', 'Price/Night', 'Size', 'Available'].map(h => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
  roomsHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' },
  roomsTitle: { margin:0, fontSize:'15px', fontWeight:'600', color:'#1a1a2e' },
  addRoomBtn: { padding:'6px 14px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  roomFormCard: { background:'#f8f9fa', borderRadius:'8px', padding:'16px', marginBottom:'16px' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { background:'#f8f9fa', padding:'10px 12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#888', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'10px 12px', fontSize:'13px', color:'#333' }
};

export default ManageListings;