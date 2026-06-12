const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with your new API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const evaluateAnswer = async (questionTitle, questionCategory, userAnswer) => {
  const prompt = `
    You are an expert technical interviewer. Evaluate the candidate's answer.
    Question: ${questionTitle}
    Category: ${questionCategory}
    Candidate's Answer: ${userAnswer}

    Evaluate based on Clarity, Structure, and Accuracy.
    Respond STRICTLY in the following JSON format:
    {
      "overallScore": 8,
      "strengths": ["string", "string"],
      "weaknesses": ["string", "string"],
      "improvementSuggestions": ["string", "string"]
    }
  `;

  try {
    // We use the flash model for fast responses and force it to return perfect JSON
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    return JSON.parse(responseText); 
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    throw new Error("Failed to evaluate answer with AI");
  }
};

module.exports = { evaluateAnswer };