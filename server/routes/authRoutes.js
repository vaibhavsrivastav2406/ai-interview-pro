const express = require('express');
// Import both functions from the controller
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Route for registering
router.post('/register', registerUser);

// NEW: Route for logging in
router.post('/login', loginUser);

module.exports = router;