const express = require('express');
const { aliasTopTours, stats, yearlyReport, tourWithing, tourDistances, getTours, createTour, getTour, updateTour, deleteTour } = require('../controllers/tour.controller');
const { protect, restrict } = require('../controllers/auth.controller');
const { getReviews, createReview } = require('../controllers/review.controller');

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTours, getTours);
router.route('/stats').get(protect, restrict('admin', 'lead-guide', 'guide'), stats);
router.route('/yearly-report/:year').get(protect, restrict('admin', 'lead-guide', 'guide'), yearlyReport);
router.route('/').get(getTours).post(protect, restrict('admin', 'lead-guide'), createTour);
router.route('/:id').get(getTour).patch(protect, restrict('admin', 'lead-guide'), updateTour).delete(protect, restrict('admin'), deleteTour);

router.route('/:tourId/reviews').get(getReviews).post(protect, restrict('user'), createReview);

router.route('/within/:distance/center/:latlng/unit/:unit').get(tourWithing);
router.route('/distances/:latlng/unit/:unit').get(tourDistances);
module.exports = router;