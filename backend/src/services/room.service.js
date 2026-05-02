const hotelQueries = require('../queries/hotels.queries');
const roomQueries = require('../queries/rooms.queries');
const { ROLES } = require('../utils/constants');

const createRoomType = async (user, data) => 
{
    const hotel = await hotelQueries.getHotelById(data.hotelId);
    if (!hotel) throw new Error('Hotel not found');

    if (user.role === ROLES.HOST && hotel.host_id !== user.userId)
    {
        throw new Error('You can only add rooms to your own hotel');
    }

    return roomQueries.createRoomType(data);
};


const getRoomsByHotel = async (hotelId) => 
{
    return roomQueries.getRoomsByHotel(hotelId);
};

const getRoomTypeById = async (roomTypeId) => 
{
    return roomQueries.getRoomTypeById(roomTypeId);
}

const updateRoomType = async (user, roomTypeId, data) => 
{
    const room = await roomQueries.getRoomTypeById(roomTypeId);
    if (!room) throw new Error('Room type not found');

    const hotel = await hotelQueries.getHotelById(room.hotel_id);
    if (user.role === ROLES.HOST && hotel.host_id !== user.userId) 
    {
        throw new Error('You can only update rooms in your own hotel');
    }

    return roomQueries.updateRoomType(roomTypeId, data);
};

const getRoomAvailability = async (roomTypeId, checkInDate, checkOutDate) => 
{
    return roomQueries.getRoomAvailability(roomTypeId, checkInDate, checkOutDate);
};


module.exports = { createRoomType,getRoomsByHotel, getRoomTypeById,updateRoomType,  getRoomAvailability};