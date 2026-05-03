import AmenityBadge from "../amenitybadge";

const RoomCard = ({ room }) => {
  return (
    <div className="card">
      <h4>{room.type}</h4>
      <p>Price: {room.price}</p>

      <div>
        {room.amenities?.map((a, i) => (
          <AmenityBadge key={i} label={a} />
        ))}
      </div>

      <button>Book Now</button>
    </div>
  );
};

export default RoomCard;