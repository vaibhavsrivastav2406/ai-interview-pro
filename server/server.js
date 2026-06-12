const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Import all of your routes here at the top
const authRoutes = require('./routes/authRoutes'); 
const questionRoutes = require('./routes/questionRoutes'); 
const answerRoutes = require('./routes/answerRoutes'); // <-- Added Answer Routes

// 2. Create the Express app
const app = express();

// 3. Global Middleware
app.use(cors());
app.use(express.json()); // Allows the server to accept JSON data in the body

// 4. Use your routes (This MUST come AFTER app is created)
app.use('/api/auth', authRoutes); 
app.use('/api/questions', questionRoutes); 
app.use('/api/answers', answerRoutes); // <-- Plugged in Answer Routes

// 5. Connect to MongoDB Atlas
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Awesome! MongoDB is Connected.');
  })
  .catch((err) => {
    console.error('DATABASE CONNECTION FAILED!');
    console.error('The exact error is:', err.message);
  });

// 6. A simple test route to verify the server is running
app.get('/', (req, res) => {
  res.send('Hello from the AI Interview Prep Backend!');
});

// 7. Start the server listening on your port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});