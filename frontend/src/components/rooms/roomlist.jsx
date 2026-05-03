import RoomCard from './roomcard';

const RoomList = ({ rooms, onReport }) => {
  return (
    <div>
      <h3>Rooms</h3>
      {rooms.map(r => (
        <RoomCard key={r.room_type_id} room={r} onReport={onReport} />
      ))}
    </div>
  );
};

export default RoomList;