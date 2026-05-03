import { Link } from "react-router-dom";

const HotelCard = ({ hotel }) => {
  return (
    <div className="card">
      <h3>{hotel.name}</h3>
      <p>{hotel.location}</p>

      <Link to={`/hotel/${hotel.id}`}>
        <button>View Details</button>
      </Link>
    </div>
  );
};

export default HotelCard;