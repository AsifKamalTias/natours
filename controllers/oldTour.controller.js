const fs = require('fs');
const path = require('path');
const tours = JSON.parse(fs.readFileSync(path.join(__dirname, '../dev-data/data/tours-simple.json')));

exports.checkId = (request, response, next, value) => {
    try {
        const tour = tours.find((element) => {
            return element.id === Number(value);
        });

        if (tour === undefined) {
            response.status(404).json({
                status: 'fail',
                message: 'Tour not found',
                requestedAt: request.requestTime,
                data: {
                    tour: null
                }
            });
        }
        else {
            next();
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

exports.validation = (request, response, next) => {
    try {
        if (request.body.name === undefined) {
            response.status(400).json({
                status: 'fail',
                message: 'Name is required',
                requestedAt: request.requestTime,
                data: null,
            });
        }
        else {
            next();
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


exports.getTours = (request, response) => {
    try {
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

exports.getTour = (request, response) => {
    try {
        const tour = tours.find((element) => {
            return element.id === Number(request.params.id);
        });

        response.status(200).json({
            status: 'success',
            message: 'Tour found',
            requestedAt: request.requestTime,
            data: {
                tour: tour
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

exports.createTour = (request, response) => {
    try {
        const tour = Object.assign({ id: tours[tours.length - 1].id + 1 }, request.body);
        tours.push(tour);
        fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
            if (error) {
                response.status(500).json({
                    status: 'fail',
                    message: error.message,
                    requestedAt: request.requestTime,
                    data: null,
                });
            }
            else {
                response.status(201).json({
                    status: 'success',
                    message: 'Tour created successfully',
                    requestedAt: request.requestTime,
                    data: {
                        tour
                    }
                });
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

exports.updateTour = (request, response) => {
    try {
        let tour = tours.find((element) => {
            return element.id === Number(request.params.id);
        });

        tour = Object.assign(tour, request.body);
        tours[tours.findIndex((element) => {
            return element.id === Number(request.params.id);
        })] = tour;

        fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
            if (error) {
                response.status(500).json({
                    status: 'fail',
                    message: error.message,
                    requestedAt: request.requestTime,
                    data: null,
                });
            }
            else {
                response.status(200).json({
                    status: 'success',
                    message: 'Tour updated successfully',
                    requestedAt: request.requestTime,
                    data: {
                        tour
                    }
                });
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

exports.deleteTour = (request, response) => {
    try {
        const tour = tours.find((element) => {
            return element.id === Number(request.params.id);
        });

        tours.splice(tours.findIndex((element) => {
            return element.id === Number(request.params.id);
        }), 1);

        fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
            if (error) {
                response.status(500).json({
                    status: 'fail',
                    message: error.message,
                    requestedAt: request.requestTime,
                    data: null,
                });
            }
            else {
                response.status(204).json({
                    status: 'success',
                    message: 'Tour deleted successfully',
                    requestedAt: request.requestTime,
                    data: null
                });
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