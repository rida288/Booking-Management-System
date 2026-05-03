const { sql, poolPromise } = require('../config/db');

// getting all amenities
const getAllAmenities = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('usp_GetAllAmenities');
    return result.recordset;
};

// creating a new amenity
const createAmenity = async (name, description) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('name', sql.VarChar, name)
        .input('description', sql.VarChar, description || null)
        .execute('usp_CreateAmenity');
    return result.recordset ? result.recordset[0] : { message: 'Amenity created' };
};

// getting amenities for a hotel
const getHotelAmenities = async (hotelId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hotelId', sql.UniqueIdentifier, hotelId)
        .execute('usp_GetAmenitiesByHotelId');
    return result.recordset;
};

// adding an amenity to a hotel
const addHotelAmenity = async (hotelId, amenityId) => {
    const pool = await poolPromise;
    await pool.request()
        .input('hotelId', sql.UniqueIdentifier, hotelId)
        .input('amenityId', sql.UniqueIdentifier, amenityId)
        .execute('usp_AddAmenityToHotel');
    return { message: 'Amenity added to hotel' };
};

// removing  hotel amenity
const removeHotelAmenity = async (hotelId, amenityId) => {
    const pool = await poolPromise;
    await pool.request()
        .input('hotelId', sql.UniqueIdentifier, hotelId)
        .input('amenityId', sql.UniqueIdentifier, amenityId)
        .execute('usp_RemoveAmenityFromHotel');
    return { message: 'Amenity removed from hotel' };
};

// getting amenities for a room type
const getRoomTypeAmenities = async (roomTypeId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('roomTypeId', sql.UniqueIdentifier, roomTypeId)
        .execute('usp_GetAmenitiesByRoomTypeId');
    return result.recordset;
};

// adding an amenity to a room type
const addRoomTypeAmenity = async (roomTypeId, amenityId) => {
    const pool = await poolPromise;
    await pool.request()
        .input('roomTypeId', sql.UniqueIdentifier, roomTypeId)
        .input('amenityId', sql.UniqueIdentifier, amenityId)
        .execute('usp_AddAmenityToRoomType');
    return { message: 'Amenity added to room type' };
};

// removing an amenity from a room type
const removeRoomTypeAmenity = async (roomTypeId, amenityId) => {
    const pool = await poolPromise;
    await pool.request()
        .input('roomTypeId', sql.UniqueIdentifier, roomTypeId)
        .input('amenityId', sql.UniqueIdentifier, amenityId)
        .execute('usp_RemoveAmenityFromRoomType');
    return { message: 'Amenity removed from room type' };
};

module.exports = {getAllAmenities, createAmenity,getHotelAmenities, addHotelAmenity, removeHotelAmenity, getRoomTypeAmenities, addRoomTypeAmenity, removeRoomTypeAmenity};