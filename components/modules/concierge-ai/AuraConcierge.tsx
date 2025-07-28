
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../../icons';
import { useConciergeAI, Message } from '../../../hooks/useConciergeAI';
import './AuraConcierge.css';

const UserAvatar: React.FC = () => <div className="chat-message-avatar user-avatar"><Icons.User size={20} /></div>;
const AiAvatar: React.FC = () => <div className="chat-message-avatar ai-avatar"><Icons.ConciergeAI size={20} /></div>;

const ChatMessage: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      {isUser ? <UserAvatar /> : <AiAvatar />}
      <div className="chat-message-content">
        {message.text}
      </div>
    </div>
  );
});

const AuraConcierge: React.FC = () => {
  const { messages, isLoading, sendMessage } = useConciergeAI();
  const [input, setInput] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the message list whenever messages change
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="aura-concierge-container">
        <div ref={messageListRef} className="message-list">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
           {isLoading && messages[messages.length-1]?.text === '' && (
            <div className="chat-message assistant-message">
                <AiAvatar />
                <div className="chat-message-content typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        )}
        </div>
        <div className="chat-input-area">
          <form onSubmit={handleSubmit} className="chat-input-form">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aura Concierge anything..."
              className="chat-textarea"
              rows={1}
              disabled={isLoading}
            />
            <button type="submit" className="chat-send-button" disabled={isLoading || !input.trim()}>
              <Icons.Send size={20} />
            </button>
          </form>
        </div>
    </div>
  );
};

export default AuraConcierge;
