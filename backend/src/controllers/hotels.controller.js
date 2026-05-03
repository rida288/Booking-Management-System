// hotels and hotel amenities 

const HotelService = require('../services/hotels.service');

const {sendSuccess , sendError} = require('../utils/response.helper');

const createHotel = async (req, res) => 
{
  try 
  {
    const hotel = await HotelService.createHotel(req.user ,req.body);
    sendSuccess(res, hotel);
  } 
  catch (error) 
  {
   return sendError(res, error.message, 400);
  }
};

const updateHotel = async (req, res) => 
{
    try 
    {
        const hotel = await HotelService.updateHotel(req.user , req.params.id , req.body);
        return sendSuccess(res, hotel);

    }
    catch(error)
    {
        return sendError(res, error.message, 400);
    }
};

const deleteHotel = async (req, res) => 
{
    try
    {
        const hotel = await HotelService.deleteHotel(req.user , req.params.id);
        return sendSuccess(res, hotel);
    }
    catch(error)
    {
        return sendError(res, error.message, 400);
    }
};

const getHotelById = async (req, res) =>
{
    try
    {
        const hotel = await HotelService.getHotelById(req.params.id);
        return sendSuccess(res, hotel);
    }
    catch(error)
    {
        return sendError(res , error.message , 400);
    }
};

const searchHotel = async (req, res) => 
{
    try
    {
        const hotel = await HotelService.searchHotel(req.query.searchQuery  || null);
        return sendSuccess(res, hotel);
    }
    catch(error)
    {
        return sendError(res , error.message , 400);
    }
};


module.exports = { createHotel, updateHotel, deleteHotel, getHotelById, searchHotel };