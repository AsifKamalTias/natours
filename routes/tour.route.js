const express = require('express');
const { checkId, validation, getTours, createTour, getTour, updateTour, deleteTour } = require('../controllers/tour.controller');

const router = express.Router();

router.param('id', checkId);

router.route('/').get(getTours).post(validation, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;