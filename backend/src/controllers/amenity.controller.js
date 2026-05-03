// amenity 

const amenityService = require('../services/amenity.service');
const { sendSuccess, sendError } = require('../utils/response.helper');

const getAllAmenities = async (req, res) => 
{
    try 
    {
        const data = await amenityService.getAllAmenities();
        return sendSuccess(res, data);
    } 
    catch (error) 
    {
        return sendError(res, error.message, 400);
    }
};

const createAmenity = async (req, res) => 
{
    try 
    {
        const { name, description } = req.body;
        const data = await amenityService.createAmenity(req.user, name, description);
        return sendSuccess(res, data, 201);
    } 
    catch (error) 
    {
        return sendError(res, error.message, 400);
    }
};

const getHotelAmenities = async (req, res) => 
{
    try 
    {
        const data = await amenityService.getHotelAmenities(req.params.hotelId);
        return sendSuccess(res, data);
    } 
    catch (error) 
    {
        return sendError(res, error.message, 400);
    }
};

const addHotelAmenity = async (req, res) => 
{
    try 
    {
        const { amenityId } = req.body;
        const data = await amenityService.addHotelAmenity(req.user, req.params.hotelId, amenityId);
        return sendSuccess(res, data);
    } 
    catch (error) 
    {

        return sendError(res, error.message, 400);
    }
};

const removeHotelAmenity = async (req, res) => 
{
    try 
    {
        const data = await amenityService.removeHotelAmenity(req.user, req.params.hotelId, req.params.amenityId);
        return sendSuccess(res, data);
    } 
    catch (error) 
    {
        return sendError(res, error.message, 400);
    }
};

const getRoomTypeAmenities = async (req, res) => 
{
    try 
    {
        const data = await amenityService.getRoomTypeAmenities(req.params.roomTypeId);
        return sendSuccess(res, data);
    } 
    catch (error)
    {
        return sendError(res, error.message, 400);
    }
};

const addRoomTypeAmenity = async (req, res) => 
{
    try 
    {
        const { amenityId } = req.body;
        const data = await amenityService.addRoomTypeAmenity(req.user, req.params.roomTypeId, amenityId);
        return sendSuccess(res, data);
    } 
    catch (error)
    {
        return sendError(res, error.message, 400);
    }
};

const removeRoomTypeAmenity = async (req, res) => 
{
    try 
    {
        const data = await amenityService.removeRoomTypeAmenity(req.user, req.params.roomTypeId, req.params.amenityId);
        return sendSuccess(res, data);
    } 
    catch (error) 
    {
        return sendError(res, error.message, 400);
    }
};

module.exports = {getAllAmenities, createAmenity,getHotelAmenities, addHotelAmenity, removeHotelAmenity, getRoomTypeAmenities, addRoomTypeAmenity, removeRoomTypeAmenity};