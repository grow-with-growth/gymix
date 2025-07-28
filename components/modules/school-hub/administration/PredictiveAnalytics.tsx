
import React, { useState } from 'react';
import { Ollama } from '@ollama/sdk/browser';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../shared.css';
import './PredictiveAnalytics.css';
import { Icons } from '../../../icons';

interface Forecast {
    period: string;
    value: number;
    reasoning: string;
}
interface Prediction {
    trend_summary: string;
    forecast: Forecast[];
    risk_factors: string[];
}

const mockData = {
    enrollment: {
        history: [
            { period: '2020', value: 850 }, { period: '2021', value: 865 }, 
            { period: '2022', value: 880 }, { period: '2023', value: 910 }, { period: '2024', value: 930 }
        ],
        notes: "Current marketing spend is up 15%. A new housing development opened nearby."
    },
    graduation: {
        history: [
            { period: '2020', value: 92 }, { period: '2021', value: 93 }, 
            { period: '2022', value: 92.5 }, { period: '2023', value: 94 }, { period: '2024', value: 95 }
        ],
        notes: "New student support programs were implemented last year."
    }
};

const PredictiveAnalytics: React.FC = () => {
    const [forecastType, setForecastType] = useState('enrollment');
    const [isLoading, setIsLoading] = useState(false);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [error, setError] = useState('');

    const handleForecast = async () => {
        setIsLoading(true);
        setError('');
        setPrediction(null);
        
        const data = mockData[forecastType];
        const prompt = `You are a data analyst for a school. Based on the following historical data and notes, provide a predictive analysis for the next 2 years.
        Forecast Type: ${forecastType}.
        Historical Data: ${JSON.stringify(data.history)}.
        Contextual Notes: "${data.notes}".
        
        Provide your analysis in the specified JSON format.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: prompt,
                 config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            trend_summary: { type: Type.STRING, description: 'A brief summary of the historical trend.' },
                            forecast: {
                                type: Type.ARRAY,
                                description: 'Forecast for the next 2 periods.',
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        period: { type: Type.STRING },
                                        value: { type: Type.NUMBER },
                                        reasoning: { type: Type.STRING }
                                    },
                                    required: ['period', 'value', 'reasoning']
                                }
                            },
                            risk_factors: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['trend_summary', 'forecast', 'risk_factors']
                    }
                 }
            });
            const result = JSON.parse(response.text);
            setPrediction(result);
        } catch(err) {
            console.error("Prediction error:", err);
            setError("Failed to generate forecast. The AI model may have returned an unexpected format. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const chartData = prediction 
        ? [...mockData[forecastType].history.map(h => ({...h, forecastValue: null})), ...prediction.forecast.map(f => ({ period: f.period, value: null, forecastValue: f.value }))] 
        : mockData[forecastType].history.map(h => ({...h, forecastValue: null}));

    return (
    <div className="predictive-analytics-container">
        <div className="predictive-analytics-header">
            <Icons.PredictiveAI size={48} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Predictive Analytics</h2>
            <p className="text-gray-400 max-w-2xl text-center">Use historical data and AI to forecast future trends for enrollment, graduation rates, and more.</p>
        </div>
        <div className="controls-area">
            <div className="select-group">
                <label htmlFor="forecast-type">Forecast:</label>
                <select id="forecast-type" value={forecastType} onChange={e => setForecastType(e.target.value)} className="form-select">
                    <option value="enrollment">Student Enrollment</option>
                    <option value="graduation">Graduation Rates (%)</option>
                </select>
            </div>
            <button onClick={handleForecast} className="forecast-btn" disabled={isLoading}>
                 {isLoading ? <div className="loader"></div> : <><Icons.Wand2 size={20}/>Generate Forecast</>}
            </button>
        </div>
        <div className="output-container">
            {isLoading && <div className="skeleton-loader full-width"><div className="skeleton-line h-64 w-full"></div></div>}
            {error && <div className="error-message full-width">{error}</div>}
            {prediction ? (
                <>
                    <div className="output-chart">
                         <h3 className="output-title">Trend & Forecast</h3>
                         <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="period" stroke="rgba(255, 255, 255, 0.5)" />
                                <YAxis stroke="rgba(255, 255, 255, 0.5)" domain={['dataMin - 10', 'dataMax + 10']} allowDataOverflow/>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }} />
                                <Legend />
                                <Line type="monotone" dataKey="value" name="Actual" stroke="#8884d8" strokeWidth={2} connectNulls />
                                <Line type="monotone" dataKey="forecastValue" name="Forecast" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" connectNulls />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="output-card summary">
                        <h3 className="output-title"><Icons.BookOpen size={20}/> Summary</h3>
                        <p>{prediction.trend_summary}</p>
                    </div>
                     <div className="output-card risks">
                        <h3 className="output-title"><Icons.AlertTriangle size={20}/> Risk Factors</h3>
                        <ul>{prediction.risk_factors.map((risk, i) => <li key={i}>{risk}</li>)}</ul>
                    </div>
                </>
            ) : !isLoading && !error && (
                <div className="placeholder-text full-width">
                    <Icons.TrendingUp size={48} className="text-gray-600 mb-4"/>
                    Select a forecast type and click "Generate" to see AI-powered predictions.
                </div>
            )}
        </div>
    </div>
  );
};

export default PredictiveAnalytics;
