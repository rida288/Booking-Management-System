const {sql , poolPromise } = require('../config/db');
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
    .input('typeName', sql.VarChar , roomTypeData.type_name)
    .input('description', sql.VarChar, roomTypeData.description || null )
    .input('maxOccupancy', sql.Int , roomTypeData.max_occupancy)
    .input('totalRooms', sql.Int , roomTypeData.total_rooms)
    .input('basePricePerNight', sql.Decimal (12 ,2 ) , roomTypeData.base_price_per_night)
    .input('sizeSqft', sql.Decimal (8,2), roomTypeData.size_sqft || null )
    .input('bedType', sql.VarChar , roomTypeData.bed_type || null)
    .execute('usp_CreateRoomType');

    return result.recordset ? result.recordset[0] : { message: 'Room type created successfully' };
};
// update room type 
const updateRoomType = async (roomTypeId, roomTypeData) =>
{
    const pool = await poolPromise;
    await pool.request()
    .input('roomTypeId', sql.UniqueIdentifier, roomTypeId)
    .input('typeName', sql.VarChar , roomTypeData.type_name)
    .input('description', sql.VarChar, roomTypeData.description || null )
    .input('maxOccupancy', sql.Int , roomTypeData.max_occupancy)
    .input('totalRooms', sql.Int , roomTypeData.total_rooms)
    .input('basePricePerNight', sql.Decimal (12 ,2 ) , roomTypeData.base_price_per_night)
    .input('sizeSqft', sql.Decimal (8,2), roomTypeData.size_sqft || null )
    .input('bedType', sql.VarChar , roomTypeData.bed_type || null)
    .execute('usp_UpdateRoomType');

    return getRoomTypeById(roomTypeId);
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
const getRoomAvailability = async (roomTypeId, checkInDate, checkOutDate) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('roomTypeId', sql.UniqueIdentifier, roomTypeId)
        .input('checkIn', sql.Date, checkInDate)
        .input('checkOut', sql.Date, checkOutDate)
        .execute('usp_GetRoomAvaialbility');

    return result.recordset[0];
};
module.exports = { createRoomType,getRoomsByHotel, getRoomTypeById,updateRoomType,  getRoomAvailability};
