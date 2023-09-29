const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');

//APP
const app = express();

//Middlewares
const appLogStream = fs.createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' });
app.use(morgan('combined', { stream: appLogStream }));

app.use(express.json());

const requestTime = (request, response, next) => {
    request.requestTime = new Date().toISOString();
    next();
}
app.use(requestTime);

app.use(express.static(path.join(__dirname, 'public')));

// Routes
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

const oldToursRouter = require('./routes/oldTour.route');
app.use('/api/v0/tours', oldToursRouter);

const toursRouter = require('./routes/tour.route');
app.use('/api/v1/tours', toursRouter);

app.all('*', (request, response, next) => {
    response.status(404).json({
        status: 'fail',
        message: `${request.originalUrl} not found`
    });
});

module.exports = app;