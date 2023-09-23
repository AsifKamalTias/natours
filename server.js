require('dotenv').config();
const mongoose = require('mongoose');

const app = require('./app');

mongoose
    .connect(process.env.MONGO_DB_CONNECTION_STRING)
    .then(() => console.log("Connected to MongoDB."))
    .catch((err) => console.error("Could not connect to MongoDB. ", err));


app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running.');
});