const express = require('express');
const router = express.Router();

// We MUST import all three functions here for the routes to work!
const { register, login, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Standard Routes
router.post('/register', register);
router.post('/login', login);

// New Google Route
router.post('/google', googleLogin);

// Profile detail route
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;