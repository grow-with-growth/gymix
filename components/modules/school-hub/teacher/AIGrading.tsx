
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import '../shared.css';
import './AIGrading.css';
import { Icons } from '../../../icons';

const AIGrading: React.FC = () => {
    const [submission, setSubmission] = useState('');
    const [rubric, setRubric] = useState('- Correctness (40%)\n- Clarity (30%)\n- Depth of analysis (30%)');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submission.trim() || !rubric.trim()) return;

        setIsLoading(true);
        setError('');
        setFeedback('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are an AI teaching assistant. Grade the following student submission based on the provided rubric. Provide a score for each rubric item and an overall score. Then, provide constructive feedback, highlighting strengths and areas for improvement. Format your response clearly using markdown.

--- SUBMISSION ---
${submission}

--- RUBRIC ---
${rubric}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            setFeedback(response.text);

        } catch (err) {
            console.error("AI grading error:", err);
            setError("Failed to grade submission. Please check your connection or API key and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-grading-container">
            <div className="ai-grading-header">
                <Icons.AIGrading size={48} className="text-cyan-400 opacity-80" />
                <h2 className="font-orbitron text-3xl font-bold text-white">AI-Assisted Grading</h2>
                <p className="text-gray-400 max-w-2xl text-center">
                    Save time grading by getting an AI-powered first pass. Paste the student's work and your rubric to get a detailed evaluation.
                </p>
            </div>
            
            <div className="ai-grading-main">
                <form onSubmit={handleGrade} className="ai-grading-form">
                    <div className="form-group">
                        <label htmlFor="submission" className="form-label">Student Submission</label>
                        <textarea
                            id="submission"
                            value={submission}
                            onChange={(e) => setSubmission(e.target.value)}
                            placeholder="Paste student's essay, code, or short answer here..."
                            className="form-textarea submission-textarea"
                            rows={10}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rubric" className="form-label">Grading Rubric</label>
                        <textarea
                            id="rubric"
                            value={rubric}
                            onChange={(e) => setRubric(e.target.value)}
                            placeholder="Provide your grading criteria here. Be as specific as possible."
                            className="form-textarea rubric-textarea"
                            rows={5}
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="grade-btn" disabled={isLoading || !submission.trim() || !rubric.trim()}>
                        {isLoading ? <div className="loader"></div> : <><Icons.ScanLine size={20} /><span>Grade with AI</span></>}
                    </button>
                </form>

                <div className="ai-grading-output-area">
                     <h3 className="font-orbitron text-xl font-bold text-white mb-4">AI Evaluation</h3>
                     {isLoading && (
                        <div className="skeleton-loader">
                            <div className="skeleton-line w-1/3"></div>
                            <div className="skeleton-line w-1/4 mb-4"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line short"></div>
                        </div>
                    )}
                    {error && <div className="error-message">{error}</div>}
                    {feedback && <pre className="feedback-content">{feedback}</pre>}
                    {!isLoading && !feedback && !error && (
                        <div className="text-gray-500 text-center py-8">
                            The generated feedback will appear here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIGrading;
