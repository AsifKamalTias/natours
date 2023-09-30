const User = require('../models/user.model');

exports.signUp = async (request, response) => {
    try {
        const user = await User.create(request.body);
        response.status(201).json({
            status: 'success',
            message: 'Signed Up successfully',
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