const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const app = express();


/****************** Middlewares *******************/

app.use(express.json());

const appLogStream = fs.createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' });
app.use(morgan('combined', { stream: appLogStream }));

const requestTime = (request, response, next) => {
    request.requestTime = new Date().toISOString();
    next();
}
app.use(requestTime);


/****************** Routes Handlers *******************/

app.get('/', (request, response) => {
    response
        .status(200)
        .set({
            'Custom-Header': 'This is the customer header.',
        })
        .cookie('customCookie', 'customCookie', {
            maxAge: 900000,
            httpOnly: true,
        })
        .json({ message: 'Hello From Server.' });
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const getTours = (request, response) => {
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

const getTour = (request, response) => {
    try {
        const tour = tours.find((element) => {
            return element.id === Number(request.params.id);
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
            response.status(200).json({
                status: 'success',
                message: 'Tour found',
                requestedAt: request.requestTime,
                data: {
                    tour: tour
                }
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

const createTour = (request, response) => {
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

const updateTour = (request, response) => {
    try {
        let tour = tours.find((element) => {
            return element.id === Number(request.params.id);
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

const deleteTour = (request, response) => {
    try {
        const tour = tours.find((element) => {
            return element.id === Number(request.params.id);
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

/****************** Routes *******************/

const toursRouter = express.Router();
app.use('/api/v1/tours', toursRouter);

toursRouter.route('/').get(getTours).post(createTour);
toursRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

/****************** Server *******************/
app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running.');
});