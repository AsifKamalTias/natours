const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email must be valid']
    },
    photo: String,
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value);
            },
            message: 'Password must contain at least one uppercase, one lowercase, one digit and one special character'
        },
        select: false
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Confirm Password must be same as password'
        },
        select: false
    },
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.confirmPassword = undefined;
    }
    next();
});

userSchema.methods.matchPassword = async function (candidatePassword, password) {
    return await bcrypt.compare(candidatePassword, password);
}

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        return JWTTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    }
    return false;
}

module.exports = mongoose.model('User', userSchema);