
import React, { useState } from 'react';
import { Ollama } from '@ollama/sdk/browser';
import '../shared.css';
import './PredictiveBudgeting.css';
import { Icons } from '../../../icons';

const PredictiveBudgeting: React.FC = () => {
    const [department, setDepartment] = useState('Technology');
    const [isLoading, setIsLoading] = useState(false);
    const [forecast, setForecast] = useState('');
    const [error, setError] = useState('');

    const handleForecast = async () => {
        setIsLoading(true);
        setError('');
        setForecast('');
        const mockData = {
            Technology: "Last 3 years spending: $100k, $110k, $120k. Notes: Annual software license costs increase 5% yearly. A 1-to-1 student device refresh is planned in 2 years.",
            Operations: "Last 3 years spending: $140k, $150k, $165k. Notes: Energy costs increased 10% last year. A new wing is being added next year, increasing maintenance costs."
        };
        const prompt = `You are a school finance analyst. Based on the following data for the ${department} department, create a predictive budget forecast for the next 2 fiscal years.
        Data: ${mockData[department]}
        Provide a summary, year-over-year predictions with amounts, and key factors influencing the forecast.`;
        try {
            const ollama = new Ollama();
            const response = await ollama.chat({model: 'llama2:latest', messages: [{role: 'user', content: prompt}]});
            setForecast(response.message.content);
        } catch (err) {
            setError("Failed to generate forecast.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="predictive-budget-container">
            <div className="predictive-budget-header">
                <Icons.PredictiveBudgeting size={48} className="text-cyan-400" />
                <h2 className="font-orbitron text-3xl font-bold text-white">Predictive Budgeting</h2>
            </div>
            <div className="controls-area">
                <select value={department} onChange={e => setDepartment(e.target.value)}>
                    <option>Technology</option>
                    <option>Operations</option>
                    <option>Academics</option>
                </select>
                <button onClick={handleForecast} disabled={isLoading}>
                    {isLoading ? <div className="loader"></div> : <><Icons.Wand2 size={20}/>Forecast</>}
                </button>
            </div>
            <div className="output-area">
                <h3 className="font-orbitron text-xl font-bold text-white mb-4">AI Forecast for {department}</h3>
                {isLoading && <div className="skeleton-loader"><div className="skeleton-line"></div></div>}
                {error && <div className="error-message">{error}</div>}
                {forecast && <pre className="output-content">{forecast}</pre>}
            </div>
        </div>
    );
};

export default PredictiveBudgeting;
