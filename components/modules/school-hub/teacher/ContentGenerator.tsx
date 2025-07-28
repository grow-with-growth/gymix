
import React, { useState } from 'react';
import { Ollama } from '@ollama/sdk/browser';
import '../shared.css';
import './ContentGenerator.css';
import { Icons } from '../../../icons';

const ContentGenerator: React.FC = () => {
    const [contentType, setContentType] = useState('quiz');
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('10');
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        setIsLoading(true);
        setError('');
        setContent('');
        try {
            const ollama = new Ollama();
            const prompt = `You are an AI assistant for a teacher. Generate a "${contentType}" for a ${gradeLevel}th grade class on the topic of "${topic}". 
            - If it's a quiz, create 5 multiple-choice questions with 4 options each, and indicate the correct answer.
            - If it's a lesson plan, provide objectives, materials, activities, and an assessment.
            - If it's an activity idea, provide a detailed, engaging, and hands-on activity description.
            Format the output clearly using markdown.`;
            const response = await ollama.chat({model: 'llama2:latest', messages: [{role: 'user', content: prompt}]});
            setContent(response.message.content);
        } catch (err) {
            setError("Failed to generate content. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="content-gen-container">
            <div className="content-gen-header">
                <Icons.ContentGen size={48} className="text-cyan-400" />
                <h2 className="font-orbitron text-3xl font-bold text-white">AI Content Generator</h2>
                <p className="text-gray-400">Generate lesson plans, quizzes, and activity ideas in seconds.</p>
            </div>
            <div className="content-gen-main">
                <form onSubmit={handleGenerate} className="content-gen-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="content-type">Content Type</label>
                            <select id="content-type" value={contentType} onChange={e => setContentType(e.target.value)} className="form-select">
                                <option value="quiz">Quiz Questions</option>
                                <option value="lesson plan">Lesson Plan</option>
                                <option value="activity idea">Activity Idea</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="grade-level">Grade Level</label>
                            <select id="grade-level" value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="form-select">
                                {Array.from({length: 12}, (_, i) => i + 1).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="topic">Topic</label>
                        <input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., 'The Roaring Twenties'" className="form-input"/>
                    </div>
                    <button type="submit" className="generate-btn" disabled={isLoading || !topic}>
                        {isLoading ? <div className="loader"></div> : <><Icons.Wand2 size={20}/>Generate</>}
                    </button>
                </form>
                <div className="output-area">
                    {isLoading && <div className="skeleton-loader"><div className="skeleton-line"></div></div>}
                    {error && <div className="error-message">{error}</div>}
                    {content && <pre className="output-content">{content}</pre>}
                    {!isLoading && !content && !error && <div className="placeholder-text">Generated content will appear here.</div>}
                </div>
            </div>
        </div>
    );
};

export default ContentGenerator;
