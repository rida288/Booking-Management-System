// controllers/reviews.controller.js

const reviewService = require('../services/review.service');
const { sendSuccess, sendError } = require('../utils/response.helper');

function handleError(res, err) {
    const status = err.status || (err.message?.includes('not found') ? 404 : 400);
    return sendError(res, err.message, status);
}

// POST /reviews
// Role: GUEST
async function submitReview(req, res) {
    try {
        const { bookingId, overallRating, title, body } = req.body;
        const guestId = req.user.userId;

        if (!bookingId || overallRating == null) {
            return sendError(res, 'bookingId and overallRating are required.', 400);
        }
        if (overallRating < 1.0 || overallRating > 5.0) {
            return sendError(res, 'overallRating must be between 1.0 and 5.0.', 400);
        }

        const result = await reviewService.submitReview({ bookingId, guestId, overallRating, title, body });
        return sendSuccess(res, result, 201);
    } catch (err) {
        return handleError(res, err);
    }
}

// GET /reviews/:reviewId
async function getReview(req, res) {
    try {
        const review = await reviewService.getReviewById(req.params.reviewId);
        return sendSuccess(res, review);
    } catch (err) {
        return handleError(res, err);
    }
}

// GET /reviews/hotel/:hotelId
// Public
async function getHotelReviews(req, res) {
    try {
        const reviews = await reviewService.getHotelReviews(req.params.hotelId);
        return sendSuccess(res, reviews);
    } catch (err) {
        return handleError(res, err);
    }
}

// GET /reviews/my-reviews
// Role: GUEST
async function getMyReviews(req, res) {
    try {
        const reviews = await reviewService.getGuestReviews(req.user.userId);
        return sendSuccess(res, reviews);
    } catch (err) {
        return handleError(res, err);
    }
}

// GET /reviews/my-properties
// GET /reviews/my-properties/:hotelId
// Role: HOST
async function getMyPropertyReviews(req, res) {
    try {
        const hotelId = req.params.hotelId || null;
        const reviews = await reviewService.getHostReviews(req.user.userId, hotelId);
        return sendSuccess(res, reviews);
    } catch (err) {
        return handleError(res, err);
    }
}

// GET /reviews/unresponded
// Role: HOST | ADMIN
async function getUnrespondedReviews(req, res) {
    try {
        const hostId = req.user.role === 'HOST' ? req.user.userId : null;
        const reviews = await reviewService.getUnrespondedReviews(hostId);
        return sendSuccess(res, reviews);
    } catch (err) {
        return handleError(res, err);
    }
}

// GET /reviews/admin/all
// GET /reviews/admin/all/hotel/:hotelId
// GET /reviews/admin/all/guest/:guestId
// Role: ADMIN
async function getAllReviews(req, res) {
    try {
        const reviews = await reviewService.getAllReviewsAdmin({
            hotelId: req.params.hotelId || null,
            guestId: req.params.guestId || null,
        });
        return sendSuccess(res, reviews);
    } catch (err) {
        return handleError(res, err);
    }
}

// GET /reviews/analytics/top-hotels
// GET /reviews/analytics/top-hotels/:limit
// Role: ADMIN
async function getTopRatedHotels(req, res) {
    try {
        const limit = parseInt(req.params.limit, 10) || 10;
        const minReviews = parseInt(req.query.minReviews, 10) || 1;
        const hotels = await reviewService.getTopRatedHotels(minReviews, limit);
        return sendSuccess(res, hotels);
    } catch (err) {
        return handleError(res, err);
    }
}

// PATCH /reviews/:reviewId
// Role: GUEST | ADMIN
async function editReview(req, res) {
    try {
        const { reviewId } = req.params;
        const { overallRating, title, body } = req.body;

        if (overallRating != null && (overallRating < 1.0 || overallRating > 5.0)) {
            return sendError(res, 'overallRating must be between 1.0 and 5.0.', 400);
        }

        const result = await reviewService.editReview(reviewId, req.user.userId, { overallRating, title, body });
        return sendSuccess(res, result);
    } catch (err) {
        return handleError(res, err);
    }
}

// PATCH /reviews/:reviewId/respond
// Role: HOST
async function respondToReview(req, res) {
    try {
        const { reviewId } = req.params;
        const { hostResponse } = req.body;

        if (!hostResponse?.trim()) {
            return sendError(res, 'hostResponse is required.', 400);
        }

        const result = await reviewService.respondToReview(reviewId, req.user.userId, hostResponse);
        return sendSuccess(res, result);
    } catch (err) {
        return handleError(res, err);
    }
}

// DELETE /reviews/:reviewId
// Role: GUEST | ADMIN
async function deleteReview(req, res) {
    try {
        const isAdmin = req.user.role === 'ADMIN';
        const result  = await reviewService.deleteReview(req.params.reviewId, req.user.userId, isAdmin);
        return sendSuccess(res, result);
    } catch (err) {
        return handleError(res, err);
    }
}

// GET /reviews/check/:bookingId
// Role: GUEST
async function checkReviewed(req, res) {
    try {
        const hasReviewed = await reviewService.hasGuestReviewed(req.params.bookingId, req.user.userId);
        return sendSuccess(res, { hasReviewed });
    } catch (err) {
        return handleError(res, err);
    }
}

module.exports = {
    submitReview,
    getReview,
    getHotelReviews,
    getMyReviews,
    getMyPropertyReviews,
    getUnrespondedReviews,
    getAllReviews,
    getTopRatedHotels,
    editReview,
    respondToReview,
    deleteReview,
    checkReviewed,
};