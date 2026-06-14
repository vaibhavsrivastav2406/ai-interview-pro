const express = require('express');
const router = express.Router();

// We MUST import all three functions here for the routes to work!
const { register, login, googleLogin } = require('../controllers/authController');

// Standard Routes
router.post('/register', register);
router.post('/login', login);

// New Google Route
router.post('/google', googleLogin);

module.exports = router;