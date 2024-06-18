const Review = require('../models/review.model');
const APIFeatures = require('../utils/apiFeatures');

exports.getReviews = async (request, response) => {
    try {
        if(request.params.tourId) request.query.tour = request.params.tourId;
        
        let results = new APIFeatures(Review.find(), request.query).filter().sort().select();
        const reviews = await results.query;

        response.status(200).json({
            status: 'success',
            message: 'Reviews found',
            requestedAt: request.requestTime,
            data: {
                reviews
            }
        })
    }
    catch (error) {
        response.status(500).json({
            status: 'fail',
            message: error.message,
            requestedAt: request.requestTime,
            data: null,
        });
    }
}

exports.getReview = async (request, response) => {
    try {
        const review = await Review.findById(request.params.id);
        if (review) {
            response.status(200).json({
                status: 'success',
                message: 'Review found',
                requestedAt: request.requestTime,
                data: {
                    review: review
                }
            });
        }
        else {
            response.status(404).json({
                status: 'fail',
                message: 'Review Not found',
                requestedAt: request.requestTime,
                data: null
            });
        }
    }
    catch (error) {
        response.status(500).json({
            status: 'fail',
            message: error.message,
            requestedAt: request.requestTime,
            data: null,
        });
    }
}

exports.createReview = async (request, response) => {
    try {
        if (!request.body.tour) request.body.tour = request.params.tourId;
        if (!request.body.user) request.body.user = request.user.id;

        const review = await Review.create(request.body);
        response.status(201).json({
            status: 'success',
            message: 'Review created successfully',
            requestedAt: request.requestTime,
            data: {
                review
            }
        });
    }
    catch (error) {
        response.status(400).json({
            status: 'fail',
            message: error,
            requestedAt: request.requestTime,
            data: null,
        });
    }
}

exports.updateReview = async (request, response) => {
    try {
        const review = await Review.findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            runValidators: true
        });

        if (review) {
            response.status(200).json({
                status: 'success',
                message: 'Review updated successfully',
                requestedAt: request.requestTime,
                data: {
                    review
                }
            });
        }
        else {
            response.status(404).json({
                status: 'fail',
                message: 'Review Not found',
                requestedAt: request.requestTime,
                data: null
            });
        }
    }
    catch (error) {
        response.status(500).json({
            status: 'fail',
            message: error.message,
            requestedAt: request.requestTime,
            data: null,
        });
    }
}

exports.deleteReview = async (request, response) => {
    try {
        await Review.findByIdAndDelete(request.params.id);

        response.status(200).json({
            status: 'success',
            message: 'Review deleted successfully',
            requestedAt: request.requestTime,
            data: null
        });
    }
    catch (error) {
        response.status(500).json({
            status: 'fail',
            message: error.message,
            requestedAt: request.requestTime,
            data: null,
        });
    }
}