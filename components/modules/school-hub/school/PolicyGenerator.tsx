
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import '../shared.css';
import './PolicyGenerator.css';
import { Icons } from '../../../icons';

const PolicyGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Students');
  const [isLoading, setIsLoading] = useState(false);
  const [policy, setPolicy] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError('');
    setPolicy('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Generate a formal school policy document on the topic of "${topic}". The target audience is ${audience}. The policy should be comprehensive, clear, and well-structured. Include sections for Purpose, Scope, Policy Statement, Procedures, and Definitions if applicable. Format the output neatly using markdown.`;
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });

      setPolicy(response.text);

    } catch (err) {
      console.error("Policy generation error:", err);
      setError("Failed to generate policy. Please check your connection or API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="policy-gen-container">
      <div className="policy-gen-header">
        <Icons.PolicyGenerator size={48} className="text-cyan-400 opacity-80" />
        <h2 className="font-orbitron text-3xl font-bold text-white">AI Policy Generator</h2>
        <p className="text-gray-400 max-w-2xl text-center">
          Quickly draft comprehensive school policies. Just provide a topic and target audience, and let AI create a structured first draft.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="policy-gen-form">
        <div className="form-group">
          <label htmlFor="topic" className="form-label">Policy Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Acceptable Use of AI in Classrooms'"
            className="form-input"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="audience" className="form-label">Target Audience</label>
          <select 
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="form-input"
            disabled={isLoading}
          >
            <option>Students</option>
            <option>Parents</option>
            <option>Staff</option>
            <option>All Stakeholders</option>
          </select>
        </div>
        <button type="submit" className="generate-btn" disabled={isLoading || !topic.trim()}>
          {isLoading ? <div className="loader"></div> : <><Icons.Wand2 size={20} /><span>Generate Policy</span></>}
        </button>
      </form>

      <div className="policy-gen-output-area">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-orbitron text-xl font-bold text-white">Generated Policy</h3>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(policy)} disabled={!policy}>
                <Icons.ClipboardCheck size={16} /> Copy
            </button>
        </div>
        {isLoading && (
            <div className="skeleton-loader">
                <div className="skeleton-line w-1/2"></div>
                <div className="skeleton-line w-1/4 mb-4"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <br/>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
            </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {policy && (
          <pre className="policy-content">
            {policy}
          </pre>
        )}
         {!isLoading && !policy && !error && (
            <div className="text-gray-500 text-center py-8">
                The generated policy will appear here.
            </div>
        )}
      </div>
    </div>
  );
};

export default PolicyGenerator;
