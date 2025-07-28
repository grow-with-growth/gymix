
import React, { useState } from 'react';
import { Ollama } from '@ollama/sdk/browser';
import { Icons } from '../../../icons';
import './HomeworkSupport.css';

const HomeworkSupport: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const ollama = new Ollama();
      const systemInstruction = "You are a friendly and encouraging tutor for K-12 students. Your goal is to help students understand concepts and solve problems on their own. Do not give direct answers. Instead, ask guiding questions, break down the problem into smaller steps, or explain the underlying concepts in a simple way. Adapt your tone and complexity to the likely age of a student asking the question. Format your response clearly with paragraphs and bullet points if needed.";
      
      const genAIResponse = await ollama.chat({
        model: 'llama2:latest',
        messages: [{role: 'system', content: systemInstruction}, {role: 'user', content: question}]
      });
      
      setResponse(genAIResponse.message.content);

    } catch (err) {
      console.error("Homework support error:", err);
      setError(`Sorry, an error occurred while trying to get help. Please check your connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="homework-support-container">
      <div className="homework-support-header">
        <Icons.HomeworkSupport size={48} className="text-cyan-400 opacity-80" />
        <h2 className="font-orbitron text-3xl font-bold text-white">AI Homework Helper</h2>
        <p className="text-gray-400 max-w-2xl text-center">
          Stuck on a problem? Type your question below and our AI tutor will guide you to the answer without just giving it away!
        </p>
      </div>

      <form onSubmit={handleGetHelp} className="homework-support-form">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., 'What is the Pythagorean theorem?' or 'How do I balance H2 + O2 -> H2O?'"
          className="homework-support-textarea"
          rows={3}
          disabled={isLoading}
        />
        <button type="submit" className="homework-support-button" disabled={isLoading || !question.trim()}>
          {isLoading ? (
            <div className="loader"></div>
          ) : (
            <>
              <Icons.AIHelper size={20} />
              <span>Get Help</span>
            </>
          )}
        </button>
      </form>
      
      <div className="homework-support-response-area">
        {isLoading && !response && !error && (
            <div className="skeleton-loader">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
            </div>
        )}
        {error && <div className="homework-support-error">{error}</div>}
        {response && (
          <div className="homework-support-response-content">
            {response}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkSupport;
