// netlify/functions/summarize.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async function (event, context) {
  // 1. Security Check: Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 2. Parse the incoming data
    const { title, text } = JSON.parse(event.body);
    if (!title && !text) {
      return { statusCode: 400, body: "Missing text or title" };
    }

    // 3. Connect to Gemini (Accessing key from .env)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // 4. The Prompt
    const prompt = `
      You are a policy analyst for an environmental advocacy group.
      Analyze the following article title and snippet.
      
      Title: "${title}"
      Snippet: "${text}"

      Please provide:
      1. A 1-sentence summary of the core news.
      2. A "Relevance Rating" for environmental advocacy (Low/Medium/High).
      3. A draft tweet (max 280 chars) sharing this news.

      Return the response as a JSON object with keys: "summary", "relevance", "tweet".
      Do NOT wrap in markdown code blocks.
    `;

    // 5. Generate
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: jsonText,
    };

  } catch (error) {
    console.error("AI Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};