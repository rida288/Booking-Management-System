const hotelQueries = require('../queries/hotels.queries');
const { ROLES } = require('../utils/constants');

const createHotel = async (user, data) => {
    let hostId;
    if (user.role === ROLES.ADMIN && data.hostId) {
        hostId = data.hostId;
    } else {
        hostId = user.userId;
    }

    return hotelQueries.createHotel({
        hostId,
        name: data.name,
        description: data.description || null,
        address: data.address || null,
        city: data.city,
        province: data.province || null,
        country: data.country,
        starRating: data.star_rating || null,
        checkInTime: data.check_in_time || '14:00:00',
        checkOutTime: data.check_out_time || '11:00:00',
        cancellationPolicy: data.cancellation_policy || null
    });
};

const updateHotel = async (user, hotelId, data) => {
    const hotel = await hotelQueries.getHotelById(hotelId);
    if (!hotel) throw new Error('Hotel not found');
    if (user.role !== ROLES.ADMIN && hotel.host_id !== user.userId)
        throw new Error('Unauthorized to update this hotel');
    return hotelQueries.updateHotel(hotelId, data);
};

const deleteHotel = async (user, hotelId) => {
    const hotel = await hotelQueries.getHotelById(hotelId);
    if (!hotel) throw new Error('Hotel not found');
    if (user.role !== ROLES.ADMIN && hotel.host_id !== user.userId)
        throw new Error('Unauthorized to delete this hotel');
    await hotelQueries.deleteHotel(hotelId);
    return { message: 'Hotel deleted successfully' };
};

const getHotelById = async (hotelId) => {
    const hotel = await hotelQueries.getHotelById(hotelId);
    if (!hotel) throw new Error('Hotel not found');
    return hotel;
};

const searchHotel = async (filters) => {
    return hotelQueries.searchHotel(filters);
};

module.exports = { createHotel, updateHotel, deleteHotel, getHotelById, searchHotel };