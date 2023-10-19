const User = require('../models/user.model');
const APIFeatures = require('../utils/apiFeatures');

const filterData = (data, ...fields) => {
    const filteredData = {};
    Object.keys(data).forEach((element) => {
        if (fields.includes(element)) {
            filteredData[element] = data[element];
        }
    });

    return filteredData;
}

exports.getUsers = async (request, response) => {
    try {
        let results = new APIFeatures(User.find(), request.query).filter().sort().select();
        const users = await results.query;

        response.status(200).json({
            status: 'success',
            message: 'Users found',
            requestedAt: request.requestTime,
            data: {
                users
            }
        })
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

exports.getUser = async (request, response) => {
    try {
        const user = await User.findById(request.params.id);
        if (user) {
            response.status(200).json({
                status: 'success',
                message: 'User found',
                requestedAt: request.requestTime,
                data: {
                    user: user
                }
            });
        }
        else {
            response.status(404).json({
                status: 'fail',
                message: 'User Not found',
                requestedAt: request.requestTime,
                data: null
            });
        }
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

exports.createUser = async (request, response) => {
    try {
        const user = await User.create(request.body);
        response.status(201).json({
            status: 'success',
            message: 'User created successfully',
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

exports.updateUser = async (request, response) => {
    try {
        const user = await User.findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            runValidators: true
        });

        if (user) {
            response.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                requestedAt: request.requestTime,
                data: {
                    user
                }
            });
        }
        else {
            response.status(404).json({
                status: 'fail',
                message: 'User Not found',
                requestedAt: request.requestTime,
                data: null
            });
        }
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

exports.deleteUser = async (request, response) => {
    try {
        await User.findByIdAndDelete(request.params.id);

        response.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
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

exports.updateProfile = async (request, response) => {
    try {
        if (request.body.password || request.body.confirmPassword) {
            response.status(400).json({
                status: 'fail',
                message: 'Cannot update password',
                requestedAt: request.requestTime,
                data: null
            });
            return;
        }

        const filteredData = filterData(request.body, 'name', 'email');

        const user = await User.findByIdAndUpdate(request.user.id, filteredData, {
            new: true,
            runValidators: true
        });

        response.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            requestedAt: request.requestTime,
            data: {
                user
            }
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

exports.deleteProfile = async (request, response) => {
    try {
        await User.findByIdAndUpdate(request.user.id, { isActive: false });

        response.status(200).json({
            status: 'success',
            message: 'Profile deleted successfully',
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