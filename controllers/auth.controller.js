const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const generateJWTToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

}

exports.signUp = async (request, response) => {
    try {
        const user = await User.create({
            name: request.body.name,
            email: request.body.email,
            password: request.body.password,
            confirmPassword: request.body.confirmPassword
        });

        const token = generateJWTToken(user._id);

        response.status(201).json({
            status: 'success',
            message: 'Signed up successfully',
            requestedAt: request.requestTime,
            data: {
                user,
                token
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
                    if (await user.checkPassword(password, user.password)) {
                        const token = generateJWTToken(user._id);

                        response.status(200).json({
                            status: 'success',
                            message: 'Logged in successfully',
                            requestedAt: request.requestTime,
                            data: {
                                token
                            }
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