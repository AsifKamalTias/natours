require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');

const Tour = require('./../../models/tour.model');

mongoose
    .connect(process.env.MONGO_DB_CONNECTION_STRING)
    .then(() => console.log("Connected to MongoDB."))
    .catch((err) => console.error("Could not connect to MongoDB. ", err));


//REMOVE IDs From this file to work
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const importTours = async () => {
    try {
        await Tour.create(tours);
        console.log('Data Imported Successfully!');
        process.exit();
    }
    catch (error) {
        console.log(error);
    }
}

const deleteTours = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data Deleted Successfully!');
        process.exit();
    }
    catch (error) {
        console.log(error);
    }
}

if (process.argv[2] === '--import') {
    importTours();
}

if (process.argv[2] === '--delete') {
    deleteTours();
}