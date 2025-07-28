import { ollama } from '../ollama';

export class TeacherAI {
  async getResponse(prompt: string): Promise<string> {
    const fullPrompt = `As a teacher, respond to the following: ${prompt}`;
    const response = await ollama.call(fullPrompt);
    return response;
  }
}

