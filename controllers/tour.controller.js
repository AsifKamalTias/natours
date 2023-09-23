const Tour = require('../models/tour.model')

exports.getTours = async (request, response) => {
    try {
        const tours = await Tour.find();
        response.status(200).json({
            status: 'success',
            message: 'Tours found',
            requestedAt: request.requestTime,
            data: {
                tours
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

exports.getTour = async (request, response) => {
    try {
        const tour = await Tour.findById(request.params.id);
        if (tour) {
            response.status(200).json({
                status: 'success',
                message: 'Tour found',
                requestedAt: request.requestTime,
                data: {
                    tour: tour
                }
            });
        }
        else {
            response.status(404).json({
                status: 'fail',
                message: 'Tour Not found',
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

exports.createTour = async (request, response) => {
    try {
        const tour = await Tour.create(request.body);
        response.status(201).json({
            status: 'success',
            message: 'Tour created successfully',
            requestedAt: request.requestTime,
            data: {
                tour
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

exports.updateTour = async (request, response) => {
    try {
        const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            runValidators: true
        });

        if (tour) {
            response.status(200).json({
                status: 'success',
                message: 'Tour updated successfully',
                requestedAt: request.requestTime,
                data: {
                    tour
                }
            });
        }
        else {
            response.status(404).json({
                status: 'fail',
                message: 'Tour Not found',
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

exports.deleteTour = async (request, response) => {
    try {
        await Tour.findByIdAndDelete(request.params.id);

        response.status(200).json({
            status: 'success',
            message: 'Tour deleted successfully',
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