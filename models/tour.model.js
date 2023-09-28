const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Name is required'],
        unique: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Maximum Group Size is required']
    },
    difficulty: {
        type: String,
        required: [true, 'Difficulty is required']
    },
    ratingAverage: {
        type: Number,
        default: 4.5
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'Summary is required']
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'Cover Image is required']
    },
    images: [String],
    startDates: [Date],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
});

module.exports = mongoose.model('Tour', tourSchema);