const express = require('express');
const { getUsers, createUser, getUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect, restrict, signUp, login, forgetPassword, resetPassword } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/login', login);
router.post('/forget-password', forgetPassword);
router.post('/reset-password/:token', resetPassword);

router.route('/').get(protect, restrict('admin'), getUsers).post(protect, restrict('admin'), createUser);
router.route('/:id').get(protect, restrict('admin'), getUser).patch(protect, restrict('admin'), updateUser).delete(protect, restrict('admin'), deleteUser);

module.exports = router;