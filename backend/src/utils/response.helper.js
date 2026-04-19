// utils/response.helper.js

const sendSuccess = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data
    });
};

const sendError = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = { sendSuccess, sendError };