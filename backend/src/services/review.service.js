// services/review.service.js

const reviewQueries = require('../queries/reviews.queries');

const submitReview = async ({ bookingId, guestId, overallRating, title, body }) => {
    if (!bookingId || overallRating == null) {
        throw new Error('bookingId and overallRating are required');
    }
    if (overallRating < 1.0 || overallRating > 5.0) {
        throw new Error('overallRating must be between 1.0 and 5.0');
    }

    await reviewQueries.submitReview({
        bookingId,
        guestId,
        overallRating: Number(overallRating),
        title:  title ?? null,
        body:   body  ?? null,
    });

    return { message: 'Review submitted successfully.' };
};

const getReviewById = async (reviewId) => {
    const review = await reviewQueries.getReviewById(reviewId);
    if (!review) {
        const err = new Error('Review not found.');
        err.status = 404;
        throw err;
    }
    return review;
};

const getHotelReviews = async (hotelId) => {
    return reviewQueries.getHotelReviews(hotelId, 10, 1);
};

const getGuestReviews = async (guestId) => {
    return reviewQueries.getGuestReviews(guestId);
};

const getHostReviews = async (hostId, hotelId = null) => {
    return reviewQueries.getHostReviews(hostId, hotelId);
};

const getUnrespondedReviews = async (hostId = null) => {
    return reviewQueries.getUnrespondedReviews(hostId);
};

const getAllReviewsAdmin = async ({ hotelId, guestId }) => {
    return reviewQueries.getAllReviewsAdmin({
        hotelId: hotelId ?? null,
        guestId: guestId ?? null,
        minRating: null,
        maxRating: null,
    });
};

const getTopRatedHotels = async (minReviews = 5, limit = 10) => {
    return reviewQueries.getTopRatedHotels(Number(minReviews), Number(limit));
};

const editReview = async (reviewId, guestId, { overallRating, title, body }) => {
    if (overallRating != null && (overallRating < 1.0 || overallRating > 5.0)) {
        throw new Error('overallRating must be between 1.0 and 5.0');
    }
    await reviewQueries.editReview(reviewId, guestId, { overallRating, title, body });
    return { message: 'Review updated successfully.' };
};

const respondToReview = async (reviewId, hostId, hostResponse) => {
    if (!hostResponse?.trim()) {
        throw new Error('hostResponse is required');
    }
    await reviewQueries.respondToReview(reviewId, hostId, hostResponse);
    return { message: 'Response posted successfully.' };
};

const deleteReview = async (reviewId, userId, isAdmin) => {
    await reviewQueries.deleteReview(reviewId, userId, isAdmin);
    return { message: 'Review deleted.' };
};

module.exports = {
    submitReview,
    getReviewById,
    getHotelReviews,
    getGuestReviews,
    getHostReviews,
    getUnrespondedReviews,
    getAllReviewsAdmin,
    getTopRatedHotels,
    editReview,
    respondToReview,
    deleteReview,
};