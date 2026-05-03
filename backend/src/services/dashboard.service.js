const dashboardQueries = require('../queries/dashboard.queries');

const getAdminDashboard = async () => {
    return dashboardQueries.getAdminDashboard();
};

const getHostDashboard = async (hostId) => {
    return dashboardQueries.getHostDashboard(hostId);
};

module.exports = { getAdminDashboard, getHostDashboard };