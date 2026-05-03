import { useEffect, useState } from 'react';
import { getHotels } from '../../services/hotel.service';
import HotelCard from '../../components/hotels/hotelcard';
import HotelSearch from '../../components/hotels/hotelsearch';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetchHotels();
  }, []);

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
    <div>
      <h2>Hotels</h2>
      <HotelSearch onSearch={fetchHotels} />
      <div>
        {hotels.map((hotel) => (
          <HotelCard key={hotel.hotel_id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
};

export default HotelList;