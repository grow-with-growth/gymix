import { ollama } from '../ollama';

export class StudentAI {
  async getResponse(prompt: string): Promise<string> {
    const fullPrompt = `As a student, respond to the following: ${prompt}`;
    const response = await ollama.call(fullPrompt);
    return response;
  }
}

