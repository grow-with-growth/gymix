import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbKnowledgeArticles } from '@/lib/data/knowledge';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('AI insights disabled: GEMINI_API_KEY environment variable not found.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
        return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Server-side context construction
    const context = dbKnowledgeArticles.map(
        (article, index) => `DOCUMENT ${index + 1}: "${article.title}"\n${article.content}`
    ).join('\n\n');

    if (!genAI) {
      // Fallback to basic text search without AI
      const searchResults = dbKnowledgeArticles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) || 
        article.content.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      const fallbackResponse = searchResults.length > 0 
        ? `Found ${searchResults.length} articles: ${searchResults.map(a => a.title).join(', ')}`
        : "I could not find information about that in the knowledge base.";

      return new Response(JSON.stringify({ text: fallbackResponse }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are an expert assistant for the GROW YouR NEED Saas School. Answer the user's question based *only* on the provided documents. If the answer is not in the documents, say "I could not find information about that in the knowledge base." Be concise and helpful. Cite the document title you used for the information.

User's Question: "${query}"

DOCUMENTS:
---
${context}
---

Answer:`;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Knowledge Base Search API Error:', error);
    const message = error instanceof Error ? error.message : "An internal error occurred";
    return new Response(JSON.stringify({ error: 'An internal error occurred during the AI search.', details: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}