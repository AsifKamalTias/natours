const mongoose = require('mongoose');;

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review is required'],
        trim: true,
        maxlength: [500, 'Review can be maximum 500 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Minimum rating can be 1'],
        max: [5, 'Maximum rating can be 5']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Tour is required']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await this.model('Tour').findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    }
    else {
        await this.model('Tour').findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    }).populate({
        path: 'tour',
        select: 'name'
    });
    next();
});

reviewSchema.post('save', function () {
    this.constructor.calculateAverageRatings(this.tour);
});

module.exports = mongoose.model('Review', reviewSchema);
