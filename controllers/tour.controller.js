const Tour = require('../models/tour.model')

exports.getTours = async (request, response) => {
    try {
        const queries = { ...request.query };

        const specialQueries = ['page', 'sort', 'limit', 'fields'];
        specialQueries.forEach((element) => {
            delete queries[element];
        });

        let query = JSON.stringify(queries);
        query = query.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        query = JSON.parse(query);

        const results = Tour.find(query);

        const tours = await results;

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