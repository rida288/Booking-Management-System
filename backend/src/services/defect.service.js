const defectQueries = require('../queries/defects.queries');
const roomQueries = require('../queries/rooms.queries');
const hotelQueries = require('../queries/hotels.queries');
const { ROLES } = require('../utils/constants');



 
const reportDefect = async (user, data) => 
{
    const room = await roomQueries.getRoomTypeById(data.roomTypeId);
    if (!room) throw new Error('Room type not found');

    const hotel = await hotelQueries.getHotelById(room.hotel_id);
    if (user.role === ROLES.HOST && hotel.host_id !== user.userId) 
    {
        throw new Error('You can only report defects for your own hotel');
    }

    return defectQueries.reportDefect(
    {
        roomTypeId: data.roomTypeId,
        reportedBy: user.userId,
        title: data.title,
        description: data.description || null,
        severity: data.severity || 'MEDIUM'
    });
};

const getActiveDefects = async (user) => {
    if (user.role === ROLES.ADMIN) 
    {
        return defectQueries.getActiveDefects();
    }

    return defectQueries.getActiveDefectsByHost(user.userId);
};

const getRoomDefectById = async (user, defectId) =>
{
    const defect = await defectQueries.getRoomDefectById(defectId);
    if (!defect) throw new Error('Defect not found');   

    if (user.role === ROLES.HOST) 
    {
        const room = await roomQueries.getRoomTypeById(defect.room_type_id);
        const hotel = await hotelQueries.getHotelById(room.hotel_id);
        if (hotel.host_id !== user.userId) 
        {
            throw new Error('Unauthorized to view this defect');
        }
    }
    return defect;
};

const updateDefectStatus = async (user, defectId, status) => 
{
    const defect = await defectQueries.getRoomDefectById(defectId);
    if (!defect) throw new Error('Defect not found');

    const room = await roomQueries.getRoomTypeById(defect.room_type_id);
    const hotel = await hotelQueries.getHotelById(room.hotel_id);

    if (user.role === ROLES.HOST && hotel.host_id !== user.userId) 
    {
        throw new Error('You can only update defects for your own hotel');
    }

    return defectQueries.updateDefectStatus(defectId, status);
};

module.exports = {reportDefect , getActiveDefects, getRoomDefectById,  updateDefectStatus};
