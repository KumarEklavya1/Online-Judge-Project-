import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const aiCodeReview = async (code) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
Analyze the following code and provide:

1. A short summary of what the code does.
2. Potential bugs or issues.
3. Time and space complexity (if applicable).
4. Suggestions for improvement.
5. Best practices that can be applied.

Code:

${code}
        `,
  });

  return response.text;
};

export default aiCodeReview;
