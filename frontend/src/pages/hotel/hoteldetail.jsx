import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RoomCard from "../../components/rooms/roomcard";
import AmenityBadge from "../../components/amenitybadge";
import { getHotelById } from "../../services/hotel.service";
import { getRoomsByHotel } from "../../services/room.service";

const HotelDetail = () => {
  const { id } = useParams();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const hotelRes = await getHotelById(id);
    const roomRes = await getRoomsByHotel(id);

    setHotel(hotelRes.data);
    setRooms(roomRes.data);
  };

  if (!hotel) return <p>Loading...</p>;

  return (
    <div>
      <h2>{hotel.name}</h2>
      <p>{hotel.location}</p>

      {/* HOTEL AMENITIES */}
      <h3>Hotel Amenities</h3>
      <div>
        {hotel.amenities?.map((a, i) => (
          <AmenityBadge key={i} label={a} />
        ))}
      </div>

      {/* ROOMS */}
      <h3>Rooms</h3>
      <div>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default HotelDetail;