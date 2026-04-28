const {
    getUserById,
    updateProfile,
    changeUserRole,
    changeUserStatus,
    getAllUsers,
    searchUsers
} = require('../queries/user.queries');

const { ROLES } = require('../utils/constants');

const getUserProfile = async (userId) => {
    const user = await getUserById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

const updateUserProfile = async (userId, data) => {

    if (!data.fullName && !data.phone) {
        throw new Error('Nothing to update');
    }

    const updatedUser = await updateProfile(userId, {
        fullName: data.fullName,
        phone: data.phone
    });

    if (!updatedUser) {
        throw new Error('Update failed or user not found');
    }

    return updatedUser;
};

const updateUserRole = async (userId, role) => {

    const validRoles = Object.values(ROLES);

    if (!validRoles.includes(role)) {
        throw new Error('Invalid role');
    }

    const updated = await changeUserRole(userId, role);

    if (!updated) {
        throw new Error('Role update failed');
    }

    return updated;
};

const updateUserStatus = async (userId, isActive) => {

    const updated = await changeUserStatus(userId, isActive);

    if (!updated) {
        throw new Error('Status update failed');
    }

    return updated;
};

const fetchAllUsers = async () => {
    const users = await getAllUsers();

    return users;
};

const searchUserService = async (keyword) => {

    if (!keyword || keyword.trim() === '') {
        throw new Error('Search keyword is required');
    }

    const users = await searchUsers(keyword);

    return users;
};


module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserRole,
    updateUserStatus,
    fetchAllUsers,
    searchUserService
};