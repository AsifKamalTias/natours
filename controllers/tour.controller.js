const Tour = require('../models/tour.model');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (request, response, next) => {
    request.query.limit = "5";
    request.query.sort = "-ratingsAverage,price";
    next();
}

exports.getTours = async (request, response) => {
    try {
        let results = new APIFeatures(Tour.find(), request.query).filter().sort().select();
        const tours = await results.query;

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
        const tour = await Tour.findById(request.params.id).populate('reviews');
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

exports.stats = async (request, response) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    // _id: '$difficulty', //null for group by each document
                    _id: { $toUpper: '$difficulty' },
                    num: { $sum: 1 },
                    numRatings: { $sum: '$ratingQuantity' },
                    avgRating: { $avg: '$ratingAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            // {
            //     $match: { _id: { $ne: 'EASY' } }
            // }
        ]);

        response.status(200).json({
            status: 'success',
            message: 'Tour statistics found',
            requestedAt: request.requestTime,
            data: {
                stats
            }
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

exports.yearlyReport = async (request, response) => {
    try {
        const year = request.params.year;
        const reports = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTours: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: { _id: 0 }
            },
            {
                $sort: { month: 1 }
            }
        ]);

        response.status(200).json({
            status: 'success',
            message: 'Tour statistics found',
            requestedAt: request.requestTime,
            data: {
                reports
            }
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

exports.tourWithing = async (request, response) => {
    try {
        const { distance, latlng, unit } = request.params;
        const [lat, lng] = latlng.split(',');

        const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

        if (!lat || !lng) {
            response.status(400).json({
                status: 'fail',
                message: 'Please provide latitude and longitude in the format lat,lng',
                requestedAt: request.requestTime,
                data: null,
            });
            return;
        }

        const tours = await Tour.find({
            startLocation: {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radius]
                }
            }
        });

        response.status(200).json({
            status: 'success',
            message: 'Tours found',
            requestedAt: request.requestTime,
            data: {
                tours
            }
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

exports.tourDistances = async (request, response) => {
    try {
        const { latlng, unit } = request.params;
        const [lat, lng] = latlng.split(',');

        const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

        if (!lat || !lng) {
            response.status(400).json({
                status: 'fail',
                message: 'Please provide latitude and longitude in the format lat,lng',
                requestedAt: request.requestTime,
                data: null,
            });
            return;
        }

        const distances = await Tour.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [Number(lng), Number(lat)]
                    },
                    distanceField: 'distance',
                    distanceMultiplier: multiplier
                }
            },
            {
                $project: {
                    distance: 1,
                    name: 1
                }
            }
        ]);

        response.status(200).json({
            status: 'success',
            message: 'Tours found',
            requestedAt: request.requestTime,
            data: {
                distances
            }
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