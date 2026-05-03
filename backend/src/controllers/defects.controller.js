// room defects 

const DefectService = require('../services/defect.service');
const {sendSuccess , sendError} = require('../utils/response.helper');


const reportDefect = async (req, res) =>
{
    try 
    {
        const result = await DefectService.reportDefect(req.user, req.body);
        return sendSuccess(res, result, 201);
    }
    catch(error)
    {
        return sendError(res, error.message, 400);
    }
    
};
const getActiveDefects = async (req, res) =>
{
    try 
    {
        const result = await DefectService.getActiveDefects(req.user);
        return sendSuccess(res, result);
    }
    catch(error)
    {
        return sendError(res, error.message, 400);
    }
};

const getRoomDefectById = async (req, res) =>
{
    try 
    {
        const result = await DefectService.getRoomDefectById(req.user, req.params.defectId);
        return sendSuccess(res, result);
    }
    catch(error)
    {
        return sendError(res, error.message, 400);
    }
};
const updateDefectStatus = async (req, res) =>
{
    try 
    {
        const result = await DefectService.updateDefectStatus(req.user, req.params.id, req.body.status);
        return sendSuccess(res, result);
    }
    catch(error)
    {
        return sendError(res, error.message, 400);
    }
};

module.exports = {reportDefect , getActiveDefects, getRoomDefectById,  updateDefectStatus};

