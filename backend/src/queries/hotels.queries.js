const {sql, poolPromise} = require('../config/db');

const value = (data, camelKey, snakeKey, fallback = null) =>
    data[camelKey] ?? data[snakeKey] ?? fallback;

// create hotel 
const createHotel = async (hotelData) => 
{
    const pool = await poolPromise;
    const result = await pool.request()     
    .input('hostId', sql.UniqueIdentifier, hotelData.hostId)
    .input('name', sql.VarChar(255) , hotelData.name)
    .input('description', sql.VarChar(sql.MAX) , hotelData.description)
    .input('address', sql.VarChar(255) , hotelData.address)
    .input('city', sql.VarChar(100) , hotelData.city)
    .input('province', sql.VarChar(100) , hotelData.province )
    .input('country', sql.VarChar(100) , hotelData.country  )
    .input('starRating', sql.Int , hotelData.starRating )
    .input('checkInTime', sql.Time , hotelData.checkInTime )
    .input('checkOutTime', sql.Time , hotelData.checkOutTime )   
    .input('cancelationPolicy', sql.VarChar(sql.MAX) , hotelData.cancellationPolicy  )
    .execute('usp_CreateHotel');

    return result.recordset ? result.recordset[0] : { message: 'Hotel created successfully' };
};
// update 
const updateHotel = async (hotelId ,data ) => 
{
    const pool = await poolPromise;

    const result = await pool.request()     
    .input('hotelId', sql.UniqueIdentifier, hotelId)
    .input('name', sql.VarChar(255) , value(data, 'name', 'name'))
    .input('description', sql.VarChar(sql.MAX) , value(data, 'description', 'description'))
    .input('address', sql.VarChar(255) , value(data, 'address', 'address'))
    .input('city', sql.VarChar(100) , value(data, 'city', 'city'))
    .input('province', sql.VarChar(100) , value(data, 'province', 'province'))
    .input('country', sql.VarChar(100) , value(data, 'country', 'country'))
    .input('starRating', sql.Int , value(data, 'starRating', 'star_rating'))
    .input('checkInTime', sql.Time , value(data, 'checkInTime', 'check_in_time', '14:00:00'))
    .input('checkOutTime', sql.Time , value(data, 'checkOutTime', 'check_out_time', '11:00:00'))   
    .input('cancelationPolicy', sql.VarChar(sql.MAX) , value(data, 'cancellationPolicy', 'cancellation_policy'))
    .execute('usp_UpdateHotel');
 return result.recordset?.[0] || getHotelById(hotelId);
};
// delete
const deleteHotel = async (hotelId) => 
{
    const pool = await poolPromise;
    await pool.request()
        .input('hotelId', sql.UniqueIdentifier, hotelId)
        .execute('usp_DeleteHotel');
};
// search 
// searching the hotel by a terms taken as input and implemented as a query searching in multiple cols 
const searchHotel = async (searchQuery ) => 
{
    const pool = await poolPromise;
    const result = await pool.request()
        .input('searchQuery', sql.VarChar(255), searchQuery || '')
        .execute('usp_SearchHotel')
    return result.recordset;
};
// get details 
const getHotelById = async (hotelId) => 
{
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hotelId', sql.UniqueIdentifier, hotelId)
        .execute('usp_GetHotelById')

    return result.recordset[0];
};


module.exports = { createHotel, updateHotel, deleteHotel, getHotelById, searchHotel };
