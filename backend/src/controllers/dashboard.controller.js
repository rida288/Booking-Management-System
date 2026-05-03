const dashboardService = require('../services/dashboard.service');
const { sendSuccess, sendError } = require('../utils/response.helper');

const getAdminDashboard = async (req, res) => {
    try {
        const result = await dashboardService.getAdminDashboard();
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const getHostDashboard = async (req, res) => {
    try {
        const result = await dashboardService.getHostDashboard(req.user.userId);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

module.exports = { getAdminDashboard, getHostDashboard };