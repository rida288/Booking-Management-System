const express = require('express');
const router  = express.Router();

const reviewController = require('../controllers/reviews.controller');
const { protect }      = require('../middleware/auth.middleware');
const { authorize }    = require('../middleware/authorize');
const { ROLES }        = require('../utils/constants');

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/hotel/:hotelId', reviewController.getHotelReviews);

// ─── Guest ────────────────────────────────────────────────────────────────────
router.post('/',
    protect,
    authorize(ROLES.GUEST),
    reviewController.submitReview,
);
router.get('/my-reviews',
    protect,
    authorize(ROLES.GUEST),
    reviewController.getMyReviews,
);

// ─── Host ─────────────────────────────────────────────────────────────────────
router.get('/my-properties',
    protect,
    authorize(ROLES.HOST),
    reviewController.getMyPropertyReviews,
);
router.get('/my-properties/:hotelId',
    protect,
    authorize(ROLES.HOST),
    reviewController.getMyPropertyReviews,
);

// ─── Host + Admin ─────────────────────────────────────────────────────────────
router.get('/unresponded',
    protect,
    authorize(ROLES.HOST, ROLES.ADMIN),
    reviewController.getUnrespondedReviews,
);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/all',
    protect,
    authorize(ROLES.ADMIN),
    reviewController.getAllReviews,
);
router.get('/admin/all/hotel/:hotelId',
    protect,
    authorize(ROLES.ADMIN),
    reviewController.getAllReviews,
);
router.get('/admin/all/guest/:guestId',
    protect,
    authorize(ROLES.ADMIN),
    reviewController.getAllReviews,
);
router.get('/analytics/top-hotels',
    protect,
    authorize(ROLES.ADMIN),
    reviewController.getTopRatedHotels,
);
router.get('/analytics/top-hotels/:limit',
    protect,
    authorize(ROLES.ADMIN),
    reviewController.getTopRatedHotels,
);

// ─── Parameterised (must come last) ───────────────────────────────────────────
router.patch('/:reviewId/respond',
    protect,
    authorize(ROLES.HOST),
    reviewController.respondToReview,
);
router.patch('/:reviewId',
    protect,
    authorize(ROLES.GUEST, ROLES.ADMIN),
    reviewController.editReview,
);
router.delete('/:reviewId',
    protect,
    authorize(ROLES.GUEST, ROLES.ADMIN),
    reviewController.deleteReview,
);
router.get('/:reviewId',
    protect,
    reviewController.getReview,
);

module.exports = router;