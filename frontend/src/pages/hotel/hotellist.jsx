import { useEffect, useState } from 'react';
import { getHotels } from '../../services/hotel.service';
import HotelCard from '../../components/hotels/hotelcard';
import HotelSearch from '../../components/hotels/hotelsearch';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async (search = "") => {
    try {
      const res = await getHotels({ searchQuery: search });
      setHotels(res.data?.data || []);
    } catch (e) {
      console.error(e);
      setHotels([]);
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>Hotels</h2>
      <HotelSearch onSearch={fetchHotels} />
      {hotels.length === 0 ? (
        <p style={styles.empty}>No hotels found.</p>
      ) : (
        <div style={styles.grid}>
          {hotels.map((hotel) => (
            <HotelCard key={hotel.hotel_id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrap: { maxWidth:'1100px', margin:'0 auto', padding:'32px 16px' },
  heading: { fontSize:'28px', fontWeight:'700', color:'#1a1a2e', marginBottom:'24px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px', marginTop:'24px' },
  empty: { color:'#666', textAlign:'center', padding:'60px' }
};

export default HotelList;