const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Import all of your routes here at the top
const authRoutes = require('./routes/authRoutes'); 
const questionRoutes = require('./routes/questionRoutes'); 
const answerRoutes = require('./routes/answerRoutes'); // <-- Added Answer Routes
const chatRoutes = require('./routes/chatRoutes');

// 2. Create the Express app
const app = express();

// 3. Global Middleware
app.use(cors());
app.use(express.json()); // Allows the server to accept JSON data in the body

// 4. Use your routes (This MUST come AFTER app is created)
app.use('/api/auth', authRoutes); 
app.use('/api/questions', questionRoutes); 
app.use('/api/answers', answerRoutes); // <-- Plugged in Answer Routes
app.use('/api/chat', chatRoutes);

// 5. Connect to MongoDB Atlas
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Awesome! MongoDB is Connected.');
    
    // Seed questions if empty or under-populated
    const Question = require('./models/Question');
    Question.countDocuments()
      .then(count => {
        if (count <= 1) {
          console.log('Seeding default questions into the database...');
          const seedQuestions = [
            {
              title: "Reverse a Singly Linked List",
              description: "Given the head of a singly linked list, reverse the list, and return its reversed head. Implement this in O(n) time and O(1) space.",
              category: "DSA",
              difficulty: "Easy"
            },
            {
              title: "Longest Substring Without Repeating Characters",
              description: "Given a string s, find the length of the longest substring without repeating characters. Write an efficient sliding window solution.",
              category: "DSA",
              difficulty: "Medium"
            },
            {
              title: "Implement an LRU Cache",
              description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get and put methods in O(1) time complexity.",
              category: "DSA",
              difficulty: "Hard"
            },
            {
              title: "Design a URL Shortening Service",
              description: "Design a service like TinyURL. Focus on the API design, database schema, and how to redirect short URLs to original long URLs.",
              category: "System Design",
              difficulty: "Easy"
            },
            {
              title: "Design a Rate Limiter",
              description: "Design a scalable rate limiter for an API gateway. Discuss token bucket, leaking bucket, or sliding window log algorithms.",
              category: "System Design",
              difficulty: "Medium"
            },
            {
              title: "Design Twitter (X) Feed and Timeline",
              description: "Design a service that allows users to post tweets, follow others, and view a feed of tweets from followed users. Focus on fan-out write vs. fan-out read models.",
              category: "System Design",
              difficulty: "Hard"
            },
            {
              title: "Why do you want to join our company?",
              description: "Explain your motivation for applying to this specific role and organization. Highlight how your values and goals align with the company's mission.",
              category: "Behavioral",
              difficulty: "Easy"
            },
            {
              title: "Tell me about a time you faced a conflict on a team.",
              description: "Describe a specific situation where you had a disagreement with a peer or colleague, how you handled it professionally, and what the ultimate resolution was.",
              category: "Behavioral",
              difficulty: "Medium"
            },
            {
              title: "Tell me about a time you made a major mistake and how you resolved it.",
              description: "Share a story where something went wrong due to your oversight, how you owned up to the mistake, corrected the issue, and what key lessons you learned.",
              category: "Behavioral",
              difficulty: "Hard"
            }
          ];
          
          Question.deleteMany({})
            .then(() => Question.insertMany(seedQuestions))
            .then(() => console.log('Questions seeded successfully!'))
            .catch(err => console.error('Error seeding questions:', err));
        }
      });
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