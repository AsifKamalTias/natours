const express = require('express');
const { aliasTopTours, stats, yearlyReport, getTours, createTour, getTour, updateTour, deleteTour } = require('../controllers/tour.controller');
const { protect, restrict } = require('../controllers/auth.controller');

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTours, getTours);
router.route('/stats').get(protect, stats);
router.route('/yearly-report/:year').get(protect, yearlyReport);
router.route('/').get(getTours).post(protect, createTour);
router.route('/:id').get(getTour).patch(protect, updateTour).delete(protect, restrict('admin'), deleteTour);

module.exports = router;