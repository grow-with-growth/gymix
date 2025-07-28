
import React, { useState, useMemo } from 'react';
import '../shared.css';
import './SystemPrompts.css';
import { Icons } from '../../../icons';

const initialPrompts = {
    'Student Facing': [
        { id: 'study-assistant', title: 'AI Study Assistant', feature: 'Student Hub', content: "You are an AI study assistant for a K-12 student. Your name is Aura. Your purpose is to help students learn by guiding them, not by giving them the answers directly. Use the Socratic method. Ask leading questions. Explain concepts simply. Break down complex problems. Be encouraging and patient. Never just give the final answer to a homework problem." },
    ],
    'Parent Facing': [
        { id: 'homework-helper', title: 'Homework Helper', feature: 'Parent Hub', content: "You are a friendly and encouraging tutor for K-12 students. Your goal is to help students understand concepts and solve problems on their own. Do not give direct answers. Instead, ask guiding questions, break down the problem into smaller steps, or explain the underlying concepts in a simple way. Adapt your tone and complexity to the likely age of a student asking the question." },
    ],
    'Teacher Facing': [
        { id: 'content-generator', title: 'Teacher Content Generator', feature: 'Teacher Hub', content: "You are an AI assistant for a K-12 teacher. Generate educational content based on the teacher's request. Ensure the content is age-appropriate, accurate, and engaging. Adapt to requests for lesson plans, quiz questions, activity ideas, etc." },
    ],
    'Admin Facing': [
        { id: 'policy-generator', title: 'Policy Generator', feature: 'Admin Hub', content: "Generate a formal school policy document on the given topic. The target audience is specified. The policy should be comprehensive, clear, and well-structured. Include sections for Purpose, Scope, Policy Statement, Procedures, and Definitions if applicable." },
    ]
};

const allPromptsList = Object.values(initialPrompts).flat();

const SystemPrompts: React.FC = () => {
    const [prompts, setPrompts] = useState(initialPrompts);
    const [selectedPrompt, setSelectedPrompt] = useState(allPromptsList[0]);
    const [editedContent, setEditedContent] = useState(allPromptsList[0].content);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);

    const handleSelectPrompt = (prompt) => {
        setSelectedPrompt(prompt);
        setEditedContent(prompt.content);
    };

    const handleSave = () => {
        // This is a mock save. In a real app, you'd find the prompt and update it.
        alert("Prompt saved!");
    };

    const handleRevert = () => {
        const originalPrompt = allPromptsList.find(p => p.id === selectedPrompt.id);
        if(originalPrompt) {
            setEditedContent(originalPrompt.content);
        }
    };
    
    return (
    <div className="system-prompts-container">
        <div className="prompts-sidebar">
            <div className="sidebar-header">
                <Icons.SystemPrompts size={24}/>
                <h2 className="font-orbitron text-xl font-bold">System Prompts</h2>
            </div>
            <div className="prompts-list">
                {Object.entries(prompts).map(([category, promptList]) => (
                    <div key={category} className="prompt-category">
                        <h3 className="category-title">{category}</h3>
                        {promptList.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => handleSelectPrompt(p)}
                                className={`prompt-item ${selectedPrompt.id === p.id ? 'active' : ''}`}
                            >
                                <p className="prompt-title">{p.title}</p>
                                <p className="prompt-feature">{p.feature}</p>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
        <div className="prompt-editor-pane">
            {selectedPrompt && (
                <>
                    <div className="editor-header">
                        <h3 className="font-orbitron text-2xl text-white">{selectedPrompt.title}</h3>
                        <div className="editor-actions">
                            <button onClick={handleRevert} className="editor-action-btn"><Icons.Revert size={16}/>Revert to Default</button>
                            <button onClick={() => setIsTestModalOpen(true)} className="editor-action-btn"><Icons.ConciergeAI size={16}/>Test Prompt</button>
                            <button onClick={handleSave} className="save-btn"><Icons.Save size={18}/>Save Changes</button>
                        </div>
                    </div>
                    <textarea 
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="editor-textarea"
                    />
                </>
            )}
        </div>
        {isTestModalOpen && (
             <div className="modal-backdrop" onClick={() => setIsTestModalOpen(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3 className="modal-header">Test Prompt</h3>
                    <p className="text-gray-400 text-center mb-4">This is a mock test window.</p>
                    <button onClick={() => setIsTestModalOpen(false)} className="modal-close-btn"><Icons.Close/></button>
                </div>
            </div>
        )}
    </div>
  );
};

export default SystemPrompts;
