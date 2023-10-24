const express = require('express');
const { getReviews, createReview, getReview, updateReview, deleteReview } = require('../controllers/review.controller');
const { protect, restrict } = require('../controllers/auth.controller');

const router = express.Router();

router.route('/').get(getReviews).post(protect, restrict('user'), createReview);
router.route('/:id').get(getReview).patch(protect, restrict('user'), updateReview).delete(protect, restrict('user'), deleteReview);

module.exports = router;