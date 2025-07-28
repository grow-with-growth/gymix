
import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export const useConciergeAI = (role: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // You might want to have an initial message from the AI.
    // This can be a static message or fetched from an endpoint.
    setMessages([
      { role: 'model', text: 'Hello! How can I help you today?' },
    ]);
  }, []);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('/api/ai/chat', { prompt, role });
      const modelMessage: Message = { role: 'model', text: response.data.response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, role]);

  return { messages, isLoading, error, sendMessage };
};
