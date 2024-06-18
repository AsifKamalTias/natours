require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');

const Tour = require('../../models/tour.model');
const User = require('../../models/user.model');
const Review = require('../../models/review.model');

mongoose
    .connect(process.env.MONGO_DB_CONNECTION_STRING)
    .then(() => console.log("Connected to MongoDB."))
    .catch((err) => console.error("Could not connect to MongoDB. ", err));


//REMOVE IDs From this file to work
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data Imported Successfully!');
        process.exit();
    }
    catch (error) {
        console.log(error);
    }
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Deleted Successfully!');
        process.exit();
    }
    catch (error) {
        console.log(error);
    }
}

if (process.argv[2] === '--import') {
    importData();
}

if (process.argv[2] === '--delete') {
    deleteData();
}