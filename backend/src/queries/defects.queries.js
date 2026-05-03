const {sql , poolPromise } = require('../config/db');

// report defect 
const reportDefect = async (data) =>
{
    const pool = await poolPromise;
    const result = await pool.request()
    .input('roomTypeId', sql.UniqueIdentifier , data.roomTypeId)
    .input('reportedBy' , sql.UniqueIdentifier , data.reportedBy)
    .input('title' , sql.VarChar , data.title)
    .input('description', sql.VarChar, data.description )
    .input('severity' , sql.VarChar, data.severity )
    .execute('usp_CreateDefect');

    return result.recordset ? result.recordset[0] : { message: 'Defect reported successfully' };

};
// update defect status 
const updateDefectStatus = async (defectId, status) => {
    const pool = await poolPromise;
    await pool.request()
        .input('defectId', sql.UniqueIdentifier, defectId)
        .input('status', sql.VarChar, status)
        .execute('usp_UpdateDefectStatus');
    return getRoomDefectById(defectId);
};

// get active defects 
const getActiveDefects = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('usp_GetActiveDefects');

    return result.recordset;
};

const getActiveDefectsByHost = async (hostId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('hostId', sql.UniqueIdentifier, hostId)
        .execute('usp_GetActiveDefectsByHost');

    return result.recordset;
};

// getting the room defect by the id -- helper func 

const getRoomDefectById = async (defectId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('defectId', sql.UniqueIdentifier, defectId)
        .execute('usp_GetDefectById');

    return result.recordset[0];
};


module.exports = {reportDefect , getActiveDefects, getActiveDefectsByHost, getRoomDefectById,  updateDefectStatus};
