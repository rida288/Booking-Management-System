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
    const res = await getHotels(search);
    setHotels(res.data);
  };

  return (
    <div>
      <h2>Hotels</h2>

      <HotelSearch onSearch={fetchHotels} />

      <div>
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
        </div>
    </div>
    );
};
        
export default HotelList;