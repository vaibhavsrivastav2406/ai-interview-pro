const Answer = require('../models/Answer');
const Question = require('../models/Question'); // <-- We need this to get the question details
const { evaluateAnswer } = require('../services/aiService'); // <-- Import your AI service!

// 1. Submit a new answer (Now with AI!)
const submitAnswer = async (req, res) => {
  try {
    const { questionId, answerText } = req.body;

    // Step A: Find the question in the database so we know what the user is answering
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Step B: Send the question and the user's answer to OpenAI for grading!
    console.log("Sending answer to AI for evaluation...");
    const aiFeedback = await evaluateAnswer(question.title, question.category, answerText);
    console.log("AI Evaluation complete!");

    // Step C: Save the answer AND the AI feedback to the database
    const answer = await Answer.create({
      userId: req.user._id, 
      questionId,
      answerText,
      feedback: aiFeedback, // <-- We attach the AI's JSON response here
    });

    res.status(201).json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting answer' });
  }
};

// 2. Get only the logged-in user's answers (Stays exactly the same)
const getMyAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ userId: req.user._id }).populate('questionId');
    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching answers' });
  }
};

// 3. Share answer with community
const publishAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    // Verify ownership
    if (answer.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to publish this answer' });
    }
    answer.isPublic = true;
    await answer.save();
    res.json({ message: 'Answer successfully shared to the community', answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error publishing answer' });
  }
};

// 4. Toggle like on a shared answer
const likeAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const likedIndex = answer.likes.indexOf(req.user._id);

    if (likedIndex >= 0) {
      // Unlike
      answer.likes.splice(likedIndex, 1);
    } else {
      // Like
      answer.likes.push(req.user._id);
    }

    await answer.save();
    res.json({ 
      likesCount: answer.likes.length, 
      hasLiked: answer.likes.includes(req.user._id) 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error liking answer' });
  }
};

// 5. Get all public community submissions
const getPublicAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ isPublic: true })
      .populate('userId', 'name')
      .populate('questionId', 'title category difficulty')
      .sort({ createdAt: -1 });

    const formatted = answers.map(ans => ({
      _id: ans._id,
      userName: ans.userId?.name || 'Anonymous candidate',
      questionTitle: ans.questionId?.title || 'Practice Question',
      category: ans.questionId?.category || 'General',
      difficulty: ans.questionId?.difficulty || 'Medium',
      answerText: ans.answerText,
      feedback: ans.feedback,
      likes: ans.likes || [],
      likesCount: ans.likes?.length || 0,
      hasLiked: ans.likes?.includes(req.user._id),
      createdAt: ans.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching community feed' });
  }
};

module.exports = { submitAnswer, getMyAnswers, publishAnswer, likeAnswer, getPublicAnswers };