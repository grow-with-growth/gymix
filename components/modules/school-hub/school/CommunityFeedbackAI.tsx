
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import '../shared.css';
import './CommunityFeedbackAI.css';
import { Icons } from '../../../icons';

interface FeedbackAnalysis {
    sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
    summary: string;
    key_themes: string[];
    actionable_suggestions: string[];
}

const CommunityFeedbackAI: React.FC = () => {
    const [feedbackText, setFeedbackText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
    const [error, setError] = useState('');

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackText.trim()) return;

        setIsLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Analyze the following community feedback submitted to a school. Provide a detailed analysis.
            
Feedback: "${feedbackText}"`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral', 'Mixed'] },
                            summary: { type: Type.STRING },
                            key_themes: { type: Type.ARRAY, items: { type: Type.STRING } },
                            actionable_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }
                    }
                }
            });

            const parsedAnalysis = JSON.parse(response.text);
            setAnalysis(parsedAnalysis);

        } catch (err) {
            console.error("Feedback analysis error:", err);
            setError("Failed to analyze feedback. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const sentimentColors = {
        Positive: 'text-green-400 border-green-400',
        Negative: 'text-red-400 border-red-400',
        Neutral: 'text-gray-400 border-gray-400',
        Mixed: 'text-yellow-400 border-yellow-400',
    };

    return (
        <div className="feedback-ai-container">
            <div className="feedback-ai-header">
                <Icons.FeedbackAI size={48} className="text-cyan-400" />
                <h2 className="font-orbitron text-3xl font-bold text-white">Community Feedback AI</h2>
                <p className="text-gray-400 max-w-2xl text-center">
                    Paste raw feedback from students, parents, or staff to automatically summarize key themes, gauge sentiment, and get actionable suggestions.
                </p>
            </div>
            <div className="feedback-ai-main">
                <form onSubmit={handleAnalyze} className="feedback-form">
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Paste feedback here. For example: 'The new lunch menu is great, but the library hours are too short and the wifi is slow in the west wing.'"
                        className="feedback-textarea"
                        rows={8}
                        disabled={isLoading}
                    />
                    <button type="submit" className="analyze-btn" disabled={isLoading || !feedbackText.trim()}>
                        {isLoading ? <div className="loader"></div> : <><Icons.BrainCircuit size={20} /><span>Analyze Feedback</span></>}
                    </button>
                </form>

                <div className="analysis-output-area">
                    <h3 className="font-orbitron text-xl font-bold text-white mb-4">AI Analysis</h3>
                    {isLoading && <div className="skeleton-loader"><div className="skeleton-line"></div><div className="skeleton-line short"></div></div>}
                    {error && <div className="error-message">{error}</div>}
                    {analysis && (
                        <div className="analysis-results">
                            <div className="analysis-item">
                                <h4 className="item-title">Sentiment</h4>
                                <p className={`sentiment-badge ${sentimentColors[analysis.sentiment]}`}>{analysis.sentiment}</p>
                            </div>
                            <div className="analysis-item">
                                <h4 className="item-title">Summary</h4>
                                <p>{analysis.summary}</p>
                            </div>
                            <div className="analysis-item">
                                <h4 className="item-title">Key Themes</h4>
                                <div className="tag-list">
                                    {analysis.key_themes.map(theme => <span key={theme} className="tag">{theme}</span>)}
                                </div>
                            </div>
                            <div className="analysis-item">
                                <h4 className="item-title">Actionable Suggestions</h4>
                                <ul className="suggestion-list">
                                    {analysis.actionable_suggestions.map(sugg => <li key={sugg}>{sugg}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                    {!isLoading && !analysis && !error && <div className="text-gray-500 text-center py-8">Analysis will appear here.</div>}
                </div>
            </div>
        </div>
    );
};

export default CommunityFeedbackAI;
