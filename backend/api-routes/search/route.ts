
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { dbEmails } from '@/lib/data/communications';
import { dbKnowledgeArticles } from '@/lib/data/knowledge';
import { dbSchoolUsers } from '@/lib/data/school-hub';
import { WebSource } from '../../../types';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('AI insights disabled: GEMINI_API_KEY environment variable not found.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// For now, we'll use unstructured output since structured output with schemas
// requires specific formatting that may vary by SDK version

const handleInternalSearch = async (query: string) => {
    if (!genAI) {
      // Fallback search without AI
      const results = {
        knowledgeBase: dbKnowledgeArticles
          .filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.content.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(a => ({ title: a.title, snippet: a.content.substring(0, 150) + '...' })),
        emails: dbEmails
          .filter(e => e.subject.toLowerCase().includes(query.toLowerCase()) || e.body.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(e => ({ id: e.id, subject: e.subject, sender: e.sender, snippet: e.body.substring(0, 100) + '...', folder: e.folder })),
        users: dbSchoolUsers
          .filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(u => ({ id: u.id, name: u.name, role: u.role, email: u.email, department: u.department }))
      };
      return results;
    }

    const knowledgeContext = dbKnowledgeArticles.map(a => `Title: ${a.title}\nContent: ${a.content}`).join('\n---\n');
    const emailContext = dbEmails.map(e => `ID: ${e.id}\nFrom: ${e.sender}\nSubject: ${e.subject}\nBody: ${e.body}\nFolder: ${e.folder}`).join('\n---\n');
    const userContext = dbSchoolUsers.map(u => `ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Email: ${u.email}, Department: ${u.department}`).join('\n---\n');

    const prompt = `
        You are a powerful, integrated search engine for the "GROW YouR NEED Saas School" platform.
        Analyze the user's query and the provided context from different parts of the application.
        Your task is to find the most relevant information and return it in a structured JSON format. It is CRITICAL that you include the 'folder' for each email result and the 'department' for each user result.
        User Query: "${query}"
        Context from Knowledge Base:
        ---
        ${knowledgeContext}
        ---
        Context from Emails:
        ---
        ${emailContext}
        ---
        Context from User Directory:
        ---
        ${userContext}
        ---
        Instructions:
        1.  Carefully read the user's query to understand their intent.
        2.  Search through all provided context (Knowledge Base, Emails, User Directory) to find items that are highly relevant to the query.
        3.  For each relevant item, create a concise, helpful snippet that directly addresses the user's query.
        4.  If no relevant items are found in a category, return an empty array for that category.
        5.  Return the results as a JSON object with the following structure:
        {
          "knowledgeBase": [{ "title": "string", "snippet": "string" }],
          "emails": [{ "id": number, "subject": "string", "sender": "string", "snippet": "string", "folder": "string" }],
          "users": [{ "id": "string", "name": "string", "role": "string", "email": "string", "department": "string" }]
        }
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    if (!responseText) {
        throw new Error('No response text from AI model');
    }
    
    try {
        return JSON.parse(responseText);
    } catch (parseError) {
        console.error('Failed to parse AI response:', responseText);
        // Fallback to basic search if AI response is not valid JSON
        return {
            knowledgeBase: dbKnowledgeArticles
              .filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.content.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 3)
              .map(a => ({ title: a.title, snippet: a.content.substring(0, 150) + '...' })),
            emails: dbEmails
              .filter(e => e.subject.toLowerCase().includes(query.toLowerCase()) || e.body.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 3)
              .map(e => ({ id: e.id, subject: e.subject, sender: e.sender, snippet: e.body.substring(0, 100) + '...', folder: e.folder })),
            users: dbSchoolUsers
              .filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 3)
              .map(u => ({ id: u.id, name: u.name, role: u.role, email: u.email, department: u.department }))
        };
    }
}

const handleWebSearch = async (query: string) => {
    if (!genAI) {
      return { 
        text: "Web search is not available without AI configuration.", 
        sources: [] 
      };
    }

    const prompt = `You are a helpful and knowledgeable research assistant. Your task is to answer the user's query based on real-time information from Google Search. Provide a concise, well-written answer.
    
    User Query: "${query}"`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      tools: [{ googleSearchRetrieval: {} }],
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract grounding sources if available
    const candidates = response.candidates || [];
    const groundingMetadata = candidates[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    const sources: WebSource[] = groundingChunks
        .map((chunk: any) => ({
            uri: chunk.web?.uri || '',
            title: chunk.web?.title || '',
        }))
        .filter((source: WebSource) => source.uri);
    
    return { text, sources };
}


export async function POST(request: Request) {
  try {
    const { query, useWebSearch = false } = await request.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400 });
    }

    let results;
    if (useWebSearch) {
        results = await handleWebSearch(query);
    } else {
        results = await handleInternalSearch(query);
    }

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Global Search API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'An internal error occurred during the search.', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}