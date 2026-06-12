const mongoose = require('mongoose');

// This is the blueprint for how a User should look in our database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // A user MUST have a name
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  }
}, { timestamps: true }); // This automatically adds "createdAt" and "updatedAt" dates

// Export the model so we can use it in other files
module.exports = mongoose.model('User', userSchema);