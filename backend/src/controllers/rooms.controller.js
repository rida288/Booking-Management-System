// roomtypes, roomtypeamenities, roomdefects


const RoomService = require('../services/room.service');
const {sendSuccess , sendError} = require('../utils/response.helper');

const createRoomType  = async (req , res ) =>
{
    try 
    {

      const body = { ...req.body, hotelId: req.body.hotelId || req.body.hotel_id };
      const result = await RoomService.createRoomType(req.user, body);
      return sendSuccess(res, result,201);
    }
    catch(error)
    {
      return sendError(res, error.message, 400);
    }
};

const getRoomsByHotel = async (req, res) =>
{
    try 
    {
      const result = await RoomService.getRoomsByHotel(req.params.hotelId);
      return sendSuccess(res, result);
    }
    catch(error)
    {
      return sendError(res, error.message, 400);
    }
};

const getRoomTypeById = async (req, res) =>
{
    try 
    {
      const result = await RoomService.getRoomTypeById(req.params.roomTypeId);
      return sendSuccess(res, result);
    }
    catch(error)
    {
      return sendError(res, error.message, 400);
    }
};

const updateRoomType = async (req, res) =>
{
    try 
    {
       const result = await RoomService.updateRoomType(req.user, req.params.id, req.body);
      return sendSuccess(res, result);
    }
    catch(error)
    {
      return sendError(res, error.message, 400);
    }
};

const getRoomAvailability = async (req, res) =>
{
    try 
    {
 
      if (!req.query.checkInDate || !req.query.checkOutDate) {
        return sendError(res, 'checkInDate and checkOutDate are required', 400);
      }

      const result = await RoomService.getRoomAvailability(req.params.roomTypeId, req.query.checkInDate, req.query.checkOutDate);
      return sendSuccess(res, result);
    }
    catch(error)
    {
      return sendError(res, error.message, 400);
    }
};

module.exports = { createRoomType,getRoomsByHotel, getRoomTypeById,updateRoomType,  getRoomAvailability};
