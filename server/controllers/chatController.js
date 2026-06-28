const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Format chat history for Gemini model API
    // Gemini chat API expects history in the format: { role: 'user' | 'model', parts: [{ text: '...' }] }
    // Crucial: The history must start with the 'user' role, so we skip the first model greeting.
    const formattedHistory = [];
    const historySource = chatHistory || [];
    let startIndex = 0;
    if (historySource.length > 0 && historySource[0].role === 'model') {
      startIndex = 1;
    }

    for (let i = startIndex; i < historySource.length; i++) {
      formattedHistory.push({
        role: historySource[i].role === 'user' ? 'user' : 'model',
        parts: [{ text: historySource[i].text }]
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are AIPro Coach, an expert technical career coach and mock interviewer. Help the candidate with interview preparation, resume reviews, algorithm details, system design architectures, and behavioral frameworks. Keep responses relatively brief, encouraging, highly technical, and formatted using Markdown. If they ask about questions in the platform, encourage them to practice in the Interview Arena tab."
    });

    // Start a chat session with history
    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(message);
    const replyText = result.response.text();

    res.json({ reply: replyText });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ message: 'Server error during AI chat processing' });
  }
};

module.exports = { chatWithAI };
