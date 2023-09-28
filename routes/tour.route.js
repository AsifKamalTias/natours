const express = require('express');
const { aliasTopTours, stats, yearlyReport, getTours, createTour, getTour, updateTour, deleteTour } = require('../controllers/tour.controller');

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTours, getTours);
router.route('/stats').get(stats);
router.route('/yearly-report/:year').get(yearlyReport);
router.route('/').get(getTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;