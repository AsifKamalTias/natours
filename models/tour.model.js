const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Name is required'],
        unique: true,
        minlength: [5, 'Name must have minimum 5 characters'],
        maxlength: [40, 'Name can be maximum 40 characters'],
        // validate: [validator.isAlpha, 'Name must contain only character'] // using validator package
    },
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
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
        required: [true, 'Difficulty is required'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Difficulty can be either easy, medium, hard"
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Minimum rating can be 1'],
        max: [5, 'Maximum rating can be 5']
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (value) {
                return value < this.price
            },
            message: 'Discount price ({VALUE}) should be less than price'
        }
    },
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
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.post('save', function (document, next) {
//     console.log('Document saved.');
//     next();
// });

tourSchema.pre('/^find/', function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});

module.exports = mongoose.model('Tour', tourSchema);