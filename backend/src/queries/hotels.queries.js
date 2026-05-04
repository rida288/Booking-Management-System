const {sql, poolPromise} = require('../config/db');

// create hotel 
const createHotel = async (hotelData) => 
{
    const pool = await poolPromise;
    const result = await pool.request()     
    .input('hostId', sql.UniqueIdentifier, hotelData.hostId)
    .input('name', sql.VarChar , hotelData.name)
    .input('description', sql.VarChar , hotelData.description)
    .input('address', sql.VarChar , hotelData.address)
    .input('city', sql.VarChar , hotelData.city)
    .input('province', sql.VarChar , hotelData.province )
    .input('country', sql.VarChar , hotelData.country  )
    .input('starRating', sql.Int , hotelData.starRating )
    .input('checkInTime', sql.Time, new Date('1900-01-01T14:00:00'))
    .input('checkOutTime', sql.Time, new Date('1900-01-01T11:00:00'))  
    .input('cancellationPolicy', sql.VarChar , hotelData.cancellationPolicy  )
    .execute('usp_CreateHotel');

    return result.recordset ? result.recordset[0] : { message: 'Hotel created successfully' };
};

const getMyHotels = async (hostId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hostId', sql.UniqueIdentifier, hostId)
        .execute('usp_GetHotelsByHost');
    return result.recordset;
};

// update 
const updateHotel = async (hotelId ,data ) => 
{
    const pool = await poolPromise;
    await pool.request()     
    .input('hotelId', sql.UniqueIdentifier, hotelId)
    .input('name', sql.VarChar , data.name)
    .input('description', sql.VarChar , data.description || null )
    .input('address', sql.VarChar , data.address || null )
    .input('city', sql.VarChar , data.city)
    .input('province', sql.VarChar , data.province || null )
    .input('country', sql.VarChar , data.country  )
    .input('starRating', sql.Int , data.starRating|| null )
    .input('checkInTime', sql.Time , data.checkInTime || '14:00:00' )
    .input('checkOutTime', sql.Time , data.checkOutTime || '11:00:00' )   
    .input('cancelationPolicy', sql.VarChar , data.cancellationPolicy  )
    .execute('usp_UpdateHotel');
 return getHotelById(hotelId);
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
        .input('searchQuery', sql.VarChar, searchQuery)
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


module.exports = { createHotel, updateHotel, deleteHotel, getHotelById, searchHotel, getMyHotels };
