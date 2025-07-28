import { MemoryVectorStore } from 'memory-vector-store';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

const embeddings = new OllamaEmbeddings({
  model: 'llama2',
  baseUrl: 'http://localhost:11434'
});

export const vectorStore = new MemoryVectorStore(embeddings);

