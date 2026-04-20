import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { content, intent } = await req.json();

    const prompt = `
    You are an expert AI tutor. A user has provided the following study material.
    Their specific intent/goal is: "${intent}".

    Based on the study material and their goal, generate three structured items:
    1. A Mindmap/Summary (3-5 bullet points)
    2. Flashcards (at least 3 key question/answer pairs)
    3. A Quiz (3 multiple-choice questions with 4 options and the correct answer index)

    Study Material:
    """
    ${content}
    """

    Return the final response strictly in the following JSON format without any markdown wrappers (do not include \`\`\`json):
    {
      "summary": ["point 1", "point 2"],
      "flashcards": [{"front": "Q1", "back": "A1"}],
      "quizzes": [
        {
          "question": "Q1",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0
        }
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const dataText = response.text;
    if (!dataText) throw new Error("No response generated.");

    const parsedData = JSON.parse(dataText);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
