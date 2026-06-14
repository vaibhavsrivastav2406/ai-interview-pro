const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// 1. STANDARD REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, message: 'User created successfully' });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// 2. STANDARD LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token, message: 'Logged in successfully' });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// 3. GOOGLE LOGIN (Updated for Access Tokens via Fetch)
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // 1. Ask Google for the user's profile using the Access Token
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!googleResponse.ok) {
      return res.status(400).json({ message: "Invalid Google Access Token" });
    }

    // 2. Extract the profile data
    const { email, name } = await googleResponse.json();

    // 3. Check if user already exists in your MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // 4. Create new user if they don't exist
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedRandomPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name: name,
        email: email,
        password: hashedRandomPassword, 
      });
      await user.save();
    }

    // 5. Generate your custom JWT
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token: jwtToken, message: "Google Login Successful!" });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Failed to authenticate with Google" });
  }
};

module.exports = { register, login, googleLogin };