const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');;
const sendEmail = require('../utils/mail')

const generateJWTToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const getJWTCookieOptions = () => {
    const cookieConfig = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)),
        httpOnly: true
    }

    if (process.env.APP_ENV !== 'development') {
        cookieConfig.secure = true;
    }

    return cookieConfig;
}

exports.protect = async (request, response, next) => {
    try {
        let token;
        if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
            token = request.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            if (decodedToken) {
                const user = await User.findById(decodedToken.id);
                if (user) {
                    if (user.passwordChangedAfter(decodedToken.iat)) {
                        response.status(401).json({
                            status: 'fail',
                            message: 'Authorization failed',
                            requestedAt: request.requestTime,
                            data: null,
                        });
                    }
                    else {
                        request.user = user;
                        next();
                    }
                }
                else {
                    response.status(401).json({
                        status: 'fail',
                        message: 'Authorization failed',
                        requestedAt: request.requestTime,
                        data: null,
                    });
                }
            }
            else {
                response.status(401).json({
                    status: 'fail',
                    message: 'Authorization failed',
                    requestedAt: request.requestTime,
                    data: null,
                });
            }
        }
        else {
            response.status(401).json({
                status: 'fail',
                message: 'Authorization failed',
                requestedAt: request.requestTime,
                data: null,
            });
        }
    }
    catch (error) {
        response.status(401).json({
            status: 'fail',
            message: 'Authorization failed',
            requestedAt: request.requestTime,
            data: null,
        });
    }

}

exports.restrict = (...roles) => {
    return (request, response, next) => {
        if (!roles.includes(request.user.role)) {
            response.status(403).json({
                status: 'fail',
                message: 'Access denied',
                requestedAt: request.requestTime,
                data: null,
            });
        }
        next();
    }
}

exports.signUp = async (request, response) => {
    try {
        const user = await User.create({
            name: request.body.name,
            email: request.body.email,
            password: request.body.password,
            confirmPassword: request.body.confirmPassword
        });

        user.password = undefined;

        const token = generateJWTToken(user._id);

        response.cookie('jwt', token, getJWTCookieOptions());

        response.status(201).json({
            status: 'success',
            message: 'Signed up successfully',
            requestedAt: request.requestTime,
            data: {
                user
            }
        });
    }
    catch (error) {
        response.status(400).json({
            status: 'fail',
            message: error,
            requestedAt: request.requestTime,
            data: null,
        });
    }
}

exports.login = async (request, response) => {
    try {
        const { email, password } = request.body;

        if (email) {
            if (password) {
                const user = await User.findOne({ email }).select('+password');
                if (user) {
                    if (await user.matchPassword(password, user.password)) {
                        const token = generateJWTToken(user._id);

                        response.cookie('jwt', token, getJWTCookieOptions());

                        response.status(200).json({
                            status: 'success',
                            message: 'Logged in successfully',
                            requestedAt: request.requestTime,
                            data: null,
                        });
                    }
                    else {
                        response.status(401).json({
                            status: 'fail',
                            message: 'Invalid Email or Password',
                            requestedAt: request.requestTime,
                            data: null,
                        });
                    }
                }
                else {
                    response.status(401).json({
                        status: 'fail',
                        message: 'Invalid Email or Password',
                        requestedAt: request.requestTime,
                        data: null,
                    });
                }
            }
            else {
                response.status(422).json({
                    status: 'fail',
                    message: 'Password is required',
                    requestedAt: request.requestTime,
                    data: null,
                });
            }
        }
        else {
            response.status(422).json({
                status: 'fail',
                message: 'Email is required',
                requestedAt: request.requestTime,
                data: null,
            });
        }
    }
    catch (error) {
        response.status(400).json({
            status: 'fail',
            message: error,
            requestedAt: request.requestTime,
            data: null,
        });
    }
}

exports.forgetPassword = async (request, response) => {
    try {
        const user = await User.findOne({ email: request.body.email });
        if (!user) {
            response.status(404).json({
                status: 'fail',
                message: 'User not found',
                requestedAt: request.requestTime,
                data: null,
            });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${request.protocol}://${request.get('host')}/api/v1/users/reset-password/${resetToken}`;
        await sendEmail({
            email: user.email,
            subject: 'Reset Password',
            message: `Use the link to reset your password:\n ${resetURL}`
        })

        response.status(200).json({
            status: 'success',
            message: 'Password reset token sent to email',
            requestedAt: request.requestTime,
            data: null
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

exports.resetPassword = async (request, response) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(request.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            response.status(400).json({
                status: 'fail',
                message: 'Invalid token or token expired',
                requestedAt: request.requestTime,
                data: null,
            });
            return;
        }

        user.password = request.body.password;
        user.confirmPassword = request.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiresAt = undefined;
        await user.save();

        const token = generateJWTToken(user._id);

        response.cookie('jwt', token, getJWTCookieOptions());

        response.status(200).json({
            status: 'success',
            message: 'Password reset successfully',
            requestedAt: request.requestTime,
            data: null
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

exports.updatePassword = async (request, response) => {
    try {
        const user = await User.findById(request.user.id).select('+password');

        if (!user.matchPassword(request.body.currentPassword, user.password)) {
            response.status(401).json({
                status: 'fail',
                message: 'Current password is wrong',
                requestedAt: request.requestTime,
                data: null,
            });
            return;
        }

        user.password = request.body.password;
        user.confirmPassword = request.body.confirmPassword;
        await user.save();

        const token = generateJWTToken(user.id);

        response.cookie('jwt', token, getJWTCookieOptions());

        response.status(200).json({
            status: 'success',
            message: 'Password updated successfully',
            requestedAt: request.requestTime,
            data: null
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