import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('AI insights disabled: GEMINI_API_KEY environment variable not found.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function POST(request: Request) {
  try {
    if (!genAI) {
      return new Response(JSON.stringify({ error: 'AI service is not configured' }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { prompt } = await request.json();

    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required for generation' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Generation API Error:', error);
    const message = error instanceof Error ? error.message : "An internal error occurred";
    return new Response(JSON.stringify({ error: 'An internal error occurred while processing the AI request.', details: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
