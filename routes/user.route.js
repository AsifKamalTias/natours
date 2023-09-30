const express = require('express');
const { getUsers, createUser, getUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { signUp, login } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/login', login);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;