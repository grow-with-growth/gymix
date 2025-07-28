import { Ollama } from 'langchain/llms/ollama';

export const ollama = new Ollama({
  baseURL: 'http://localhost:11434',
  model: 'llama2',
});

