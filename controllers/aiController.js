const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure GEMINI_API_KEY is in the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

// @desc    Get AI budgeting advice
// @route   POST /api/ai-advisor
const getAIAdvice = async (req, res, next) => {
    try {
        const { income, expenses } = req.body;
        
        if (!income) {
            res.status(400);
            throw new Error('Income is required for advice');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast standard model
        
        const prompt = `
        You are an expert AI personal finance advisor. 
        A user has a total monthly income of $${income} and their current expenses total $${expenses}.
        Based on this, provide a brief, encouraging 3-paragraph financial advice and a simple suggested budget breakdown 
        (e.g., Needs, Wants, Savings) using percentage rules (like 50/30/20) tailored to their situation.
        Format your response cleanly in simple HTML tags (e.g., <p>, <ul>, <li>, <strong>) so it can be displayed directly on a webpage.
        Do not use markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ advice: text });

    } catch (error) {
        // Pass to error handler middleware
        next(error);
    }
};

module.exports = {
    getAIAdvice
};
