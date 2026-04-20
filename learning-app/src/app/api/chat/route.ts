import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { context, messages } = await req.json();

    const prompt = `You are an expert AI tutor. 
    The user is studying the following material:
    """
    ${context}
    """
    
    Answer the user's questions based on this material. Be highly encouraging and clear. 
    If the user asks for more quizzes, generate them. If they ask for deeper explanations, provide them extensively. You are not strictly limited to concise answers if the user wants thorough explanations or more practice material.`;

    let conversationText = prompt + "\n\n--- Conversation History ---\n";
    for (const msg of messages) {
       conversationText += `\n${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`;
    }
    conversationText += `\nTutor:`;

    let dataText = "";
    
    // Add automatic retry loop to handle common 503 Service Unavailable errors
    const maxRetries = 4;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: conversationText,
            });
            dataText = response.text || "";
            if (!dataText) throw new Error("Empty response");
            break; // Success
        } catch (error: any) {
             if (attempt === maxRetries) {
                 throw error; // Throw on final attempt
             }
             // Wait 4 seconds before retrying
             await new Promise(res => setTimeout(res, 4000));
        }
    }

    return NextResponse.json({ text: dataText });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
