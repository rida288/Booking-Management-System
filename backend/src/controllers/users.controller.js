const userService = require('../services/user.service');
const { sendSuccess, sendError } = require('../utils/response.helper');


const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await userService.getUserProfile(userId);

        return sendSuccess(res, user, 200, 'Profile fetched successfully');

    } catch (err) {
        return sendError(res, err.message, 404);
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const updatedUser = await userService.updateUserProfile(userId, req.body);

        return sendSuccess(res, updatedUser, 200, 'Profile updated successfully');

    } catch (err) {
        return sendError(res, err.message, 400);
    }
};
//admin//
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.fetchAllUsers();

        return sendSuccess(res, users, 200, 'Users fetched successfully');

    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const updateRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        const updated = await userService.updateUserRole(userId, role);

        return sendSuccess(res, updated, 200, 'User role updated');

    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const updateStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { isActive } = req.body;

        const updated = await userService.updateUserStatus(userId, isActive);

        return sendSuccess(res, updated, 200, 'User status updated');

    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const searchUsers = async (req, res) => {
    try {
        const { keyword } = req.query;

        const users = await userService.searchUserService(keyword);

        return sendSuccess(res, users, 200, 'Search results fetched');

    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAllUsers,
    updateRole,
    updateStatus,
    searchUsers
};