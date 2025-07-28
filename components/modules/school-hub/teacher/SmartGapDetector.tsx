
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import '../shared.css';
import './SmartGapDetector.css';
import { Icons } from '../../../icons';

const SmartGapDetector: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [answers, setAnswers] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [gaps, setGaps] = useState('');
    const [error, setError] = useState('');

    const handleDetect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || !answers.trim()) return;
        setIsLoading(true);
        setError('');
        setGaps('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are an expert educational analyst. Analyze the following student answers for a quiz on the topic of "${topic}". Identify common themes, misunderstandings, or knowledge gaps. Provide a bulleted list of these gaps and suggest a teaching strategy to address each one.

--- STUDENT ANSWERS (separated by newlines) ---
${answers}`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setGaps(response.text);
        } catch (err) {
            setError("Failed to analyze gaps. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
    <div className="gap-detector-container">
        <div className="gap-detector-header">
            <Icons.GapDetector size={48} className="text-cyan-400" />
            <h2 className="font-orbitron text-3xl font-bold text-white">Smart Gap Detector</h2>
            <p className="text-gray-400 max-w-2xl text-center">
                Identify class-wide knowledge gaps. Input a topic and a list of student answers (e.g., from a short quiz) to get AI-powered insights.
            </p>
        </div>
        <div className="gap-detector-main">
            <form onSubmit={handleDetect} className="gap-detector-form">
                <div className="form-group">
                    <label htmlFor="topic" className="form-label">Topic / Question</label>
                    <input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., 'What is photosynthesis?'" className="form-input"/>
                </div>
                <div className="form-group">
                    <label htmlFor="answers" className="form-label">Student Answers (one per line)</label>
                    <textarea id="answers" value={answers} onChange={e => setAnswers(e.target.value)} rows={10} className="form-textarea" placeholder="Plants use water and air to make food.&#x0a;It's how plants eat sunlight.&#x0a;Plants take in CO2 and release oxygen."/>
                </div>
                <button type="submit" className="detect-btn" disabled={isLoading || !topic || !answers}>
                    {isLoading ? <div className="loader"></div> : <><Icons.Siren size={20}/>Detect Gaps</>}
                </button>
            </form>
            <div className="output-area">
                <h3 className="font-orbitron text-xl font-bold text-white mb-4">Analysis Results</h3>
                {isLoading && <div className="skeleton-loader"><div className="skeleton-line"></div><div className="skeleton-line short"></div></div>}
                {error && <div className="error-message">{error}</div>}
                {gaps && <pre className="output-content">{gaps}</pre>}
                {!isLoading && !gaps && !error && <div className="text-gray-500 text-center py-8">Identified gaps and teaching suggestions will appear here.</div>}
            </div>
        </div>
    </div>
  );
};

export default SmartGapDetector;
