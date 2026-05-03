const {sql , poolPromise } = require('../config/db');

const value = (data, camelKey, snakeKey, fallback = null) =>
    data[camelKey] ?? data[snakeKey] ?? fallback;

// getting the room type by id 
const getRoomTypeById = async (RoomTypeId) =>
{
    const pool = await poolPromise;
    const result = await pool.request()
    .input('roomTypeId', sql.UniqueIdentifier, RoomTypeId)
    .execute('usp_GetRoomTypeById');

    return result.recordset[0];
};
// create room type 
const createRoomType = async (roomTypeData) =>
{
    const pool = await poolPromise;
    const result = await pool.request()     
    .input('hotelId', sql.UniqueIdentifier, roomTypeData.hotelId)
    
    .input('typeName', sql.VarChar(100) , value(roomTypeData, 'typeName', 'type_name'))
    .input('description', sql.VarChar(sql.MAX), value(roomTypeData, 'description', 'description'))
    .input('maxOccupancy', sql.Int , value(roomTypeData, 'maxOccupancy', 'max_occupancy'))
    .input('totalRooms', sql.Int , value(roomTypeData, 'totalRooms', 'total_rooms'))
    .input('basePricePerNight', sql.Decimal(12 ,2) , value(roomTypeData, 'basePricePerNight', 'base_price_per_night'))
    .input('sizeSqft', sql.Decimal(8,2), value(roomTypeData, 'sizeSqft', 'size_sqft'))
    .input('bedType', sql.VarChar(50) , value(roomTypeData, 'bedType', 'bed_type'))
    .execute('usp_CreateRoomType');

    return result.recordset ? result.recordset[0] : { message: 'Room type created successfully' };
};
// update room type 
const updateRoomType = async (roomTypeId, roomTypeData) =>
{
    const pool = await poolPromise;

    const result = await pool.request()
    .input('roomTypeId', sql.UniqueIdentifier, roomTypeId)
    .input('typeName', sql.VarChar(100) , value(roomTypeData, 'typeName', 'type_name'))
    .input('description', sql.VarChar(sql.MAX), value(roomTypeData, 'description', 'description'))
    .input('maxOccupancy', sql.Int , value(roomTypeData, 'maxOccupancy', 'max_occupancy'))
    .input('totalRooms', sql.Int , value(roomTypeData, 'totalRooms', 'total_rooms'))
    .input('basePricePerNight', sql.Decimal(12 ,2) , value(roomTypeData, 'basePricePerNight', 'base_price_per_night'))
    .input('sizeSqft', sql.Decimal(8,2), value(roomTypeData, 'sizeSqft', 'size_sqft'))
    .input('bedType', sql.VarChar(50) , value(roomTypeData, 'bedType', 'bed_type'))
    .execute('usp_UpdateRoomType');

    return result.recordset?.[0] || getRoomTypeById(roomTypeId);
};
// get rooms by hotel 
const getRoomsByHotel = async (hotelId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hotelId', sql.UniqueIdentifier, hotelId)
        .execute('usp_GetRoomTypesByHotelId');

    return result.recordset;
};
// check availability 
const getRoomAvaialbility = async (roomTypeId, checkInDate, checkOutDate) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('roomTypeId', sql.UniqueIdentifier, roomTypeId)
        .input('checkIn', sql.Date, checkInDate)
        .input('checkOut', sql.Date, checkOutDate)

        .execute('usp_GetRoomAvaialbility');

    return result.recordset[0];
};
module.exports = { createRoomType,getRoomsByHotel, getRoomTypeById,updateRoomType,  getRoomAvaialbility};
