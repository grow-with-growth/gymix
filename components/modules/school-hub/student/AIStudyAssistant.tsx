
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Ollama } from 'ollama';
import { Icons } from '../../../icons';
import './AIStudyAssistant.css';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const UserAvatar: React.FC = () => <div className="study-assistant-avatar user"><Icons.User size={20} /></div>;
const AiAvatar: React.FC = () => <div className="study-assistant-avatar ai"><Icons.AIHelper size={20} /></div>;

const ChatMessage: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`study-assistant-message ${isUser ? 'user' : 'ai'}`}>
      {isUser ? <UserAvatar /> : <AiAvatar />}
      <div className="study-assistant-message-content">
        {message.text.split('**').map((part, index) => 
          index % 2 === 1 ? <strong key={index}>{part}</strong> : part
        )}
      </div>
    </div>
  );
});

const AIStudyAssistant: React.FC = () => {
  const ollama = new Ollama();
  const chatRef = useRef<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
        setIsLoading(true);
        try {
            const systemInstruction = "You are an AI study assistant for a K-12 student. Your name is Aura. Your purpose is to help students learn by guiding them, not by giving them the answers directly. Use the Socratic method. Ask leading questions. Explain concepts simply. Break down complex problems. Be encouraging and patient. Never just give the final answer to a homework problem.";
            
            const newChat = await ollama.chat({
                model: 'gemma3:4b',
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: 'Hi' },
                    { role: 'assistant', content: 'Hello! I am your AI Study Assistant. What subject can I help you with today?' }
                ]
            });
            chatRef.current = newChat;
            setMessages([{ role: 'model', text: 'Hello! I am your AI Study Assistant. What subject can I help you with today?' }]);
        } catch(e) {
            console.error("Failed to initialize chat", e);
            setMessages(prev => [...prev, {role: 'model', text: 'Error: Could not initialize AI Assistant.'}]);
        } finally {
            setIsLoading(false);
        }
    }
    initializeChat();
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chat = chatRef.current;
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await ollama.chat({
        model: 'gemma3:4b',
        messages: [...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })), { role: 'user', content: input }]
      });

      for await (const chunk of stream) {
        const chunkText = chunk.message.content;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.text += chunkText;
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error("AI Study Assistant error:", err);
      const errorMessage = "I seem to be having trouble connecting. Please check your connection and try again in a moment.";
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="study-assistant-container">
      <div className="study-assistant-message-list" ref={messageListRef}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
            <div className="study-assistant-message ai">
                <AiAvatar />
                <div className="study-assistant-message-content thinking">
                    <span></span><span></span><span></span>
                </div>
            </div>
        )}
      </div>
      <div className="study-assistant-input-area">
        <form onSubmit={handleSubmit} className="study-assistant-form">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about any subject..."
            className="study-assistant-textarea"
            rows={1}
            disabled={isLoading || !chatRef.current}
          />
          <button type="submit" className="study-assistant-send-button" disabled={isLoading || !input.trim() || !chatRef.current}>
            <Icons.Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIStudyAssistant;
