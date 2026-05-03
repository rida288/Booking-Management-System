const amenityQueries = require('../queries/amenity.queries');
const hotelQueries = require('../queries/hotels.queries');
const roomQueries = require('../queries/rooms.queries');
const { ROLES } = require('../utils/constants');

const getAllAmenities = async () => 
{
    return amenityQueries.getAllAmenities();
};

const createAmenity = async (user, name, description) => 
{
    if (user.role !== ROLES.ADMIN) 
        {
            throw new Error('Only admins can create amenities');
        }
    return amenityQueries.createAmenity(name, description);
};

// getting amenities for a hotel by hotel id
const getHotelAmenities = async (hotelId) => 
{
    const hotel = await hotelQueries.getHotelById(hotelId);
    if (!hotel) 
        {
            throw new Error('Hotel not found');
        }
    return amenityQueries.getHotelAmenities(hotelId);
};

// adding a hotel amenity
const addHotelAmenity = async (user, hotelId, amenityId) => 
{
    const hotel = await hotelQueries.getHotelById(hotelId);
    if (!hotel) 
        {
            throw new Error('Hotel not found');
        }
    if (user.role !== ROLES.ADMIN && hotel.host_id !== user.userId)
        {
            throw new Error('Unauthorized');
        }
    return amenityQueries.addHotelAmenity(hotelId, amenityId);
};

// removing a hotel amenity
const removeHotelAmenity = async (user, hotelId, amenityId) => 
{
    const hotel = await hotelQueries.getHotelById(hotelId);
    if (!hotel) 
        {
            throw new Error('Hotel not found');
        }
    if (user.role !== ROLES.ADMIN && hotel.host_id !== user.userId)
        {
            throw new Error('Unauthorized');
        }
    return amenityQueries.removeHotelAmenity(hotelId, amenityId);
};

// getting amenities for a room type by room type id
const getRoomTypeAmenities = async (roomTypeId) => 
{
    const room = await roomQueries.getRoomTypeById(roomTypeId);
    if (!room) 
        {throw new Error('Room type not found');}

    return amenityQueries.getRoomTypeAmenities(roomTypeId);
};

// adding an amenity to a room type
const addRoomTypeAmenity = async (user, roomTypeId, amenityId) => 
{
    const room = await roomQueries.getRoomTypeById(roomTypeId);
    if (!room) 
        {
            throw new Error('Room type not found');
        }
    // only the hotel host or admin can add amenities to a room type
    const hotel = await hotelQueries.getHotelById(room.hotel_id);

    if (user.role !== ROLES.ADMIN && hotel.host_id !== user.userId)
        {
            throw new Error('Unauthorized');
        }
    return amenityQueries.addRoomTypeAmenity(roomTypeId, amenityId);
};

// removing an amenity from a room type
const removeRoomTypeAmenity = async (user, roomTypeId, amenityId) => 
{
    const room = await roomQueries.getRoomTypeById(roomTypeId);
    if (!room) 
        {
            throw new Error('Room type not found');
        }
    // only the hotel host or admin can remove amenities from a room type
    const hotel = await hotelQueries.getHotelById(room.hotel_id);

    if (user.role !== ROLES.ADMIN && hotel.host_id !== user.userId)
        {
            throw new Error('Unauthorized');
        }
    return amenityQueries.removeRoomTypeAmenity(roomTypeId, amenityId);
};

module.exports = {getAllAmenities, createAmenity,getHotelAmenities, addHotelAmenity, removeHotelAmenity, getRoomTypeAmenities, addRoomTypeAmenity, removeRoomTypeAmenity};