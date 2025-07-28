
import React, { useState } from 'react';
import { Ollama } from '@ollama/sdk/browser';
import '../shared.css';
import './CrisisManagementHub.css';
import { Icons } from '../../../icons';

type CrisisStatus = 'clear' | 'lockdown' | 'alert';

interface ConfirmationModalState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor: string;
    onConfirm: () => void;
}

const CrisisManagementHub: React.FC = () => {
    const [crisisType, setCrisisType] = useState('weather');
    const [channel, setChannel] = useState('Email');
    const [isLoading, setIsLoading] = useState(false);
    const [draft, setDraft] = useState('');
    const [status, setStatus] = useState<CrisisStatus>('clear');
    const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState | null>(null);

    const handleAction = (action: string, status: CrisisStatus) => {
        setStatus(status);
        // In a real app, this would trigger backend actions & logging.
    }
    
    const requestConfirmation = (
        title: string, 
        message: string, 
        confirmText: string,
        confirmColor: string,
        onConfirm: () => void
    ) => {
        setConfirmationModal({
            isOpen: true,
            title,
            message,
            confirmText,
            confirmColor,
            onConfirm,
        });
    };
    
    const closeConfirmationModal = () => {
        if (confirmationModal) {
            setConfirmationModal({ ...confirmationModal, isOpen: false });
            setTimeout(() => setConfirmationModal(null), 300); // Allow for fade-out animation
        }
    };

    const handleDraft = async () => {
        setIsLoading(true);
        setDraft('');
        try {
            const ollama = new Ollama();
            const prompt = `You are a school administrator. Draft a clear, calm, and informative message to parents about a crisis situation.\n            Crisis Type: ${crisisType}.\n            Communication Channel: ${channel}. (e.g., for SMS, be very concise. For Email, be more detailed).\n            Include key information like the school\'s status (e.g., lockdown, early dismissal), instructions for parents, and where to find updates.`;
            const response = await ollama.chat({model: 'llama2:latest', messages: [{role: 'user', content: prompt}]});
            setDraft(response.message.content);
        } catch (e) {
            setDraft("Error generating draft.");
        }
        setIsLoading(false);
    };
        }
        setIsLoading(false);
    };

    const statusConfig = {
        clear: { text: "All Clear", color: "status-green", icon: Icons.CheckCircle },
        lockdown: { text: "Lockdown in Effect", color: "status-red", icon: Icons.Siren },
        alert: { text: "Active Alert", color: "status-yellow", icon: Icons.AlertTriangle },
    };
    
    const StatusIcon = statusConfig[status].icon;

  return (
    <>
    <div className="crisis-hub-container">
        <div className="crisis-hub-content">
            <div className={`status-banner ${statusConfig[status].color}`}>
                <StatusIcon size={20}/>
                <span>{statusConfig[status].text}</span>
            </div>
            <h2 className="font-orbitron text-2xl text-center font-bold text-white -mt-2">Crisis Management Hub</h2>
            <div className="crisis-hub-main-card">
                 {/* AI Comms Section */}
                <div className="ai-comms-section">
                    <h3 className="comms-title"><Icons.ConciergeAI size={20}/> AI Communication Draft</h3>
                    <div className="draft-controls">
                        <select value={crisisType} onChange={e => setCrisisType(e.target.value)} className="draft-select">
                            <option value="weather">Inclement Weather</option>
                            <option value="medical">Medical Emergency</option>
                            <option value="security">Security Threat</option>
                        </select>
                        <select value={channel} onChange={e => setChannel(e.target.value)} className="draft-select">
                            <option>Email</option><option>SMS</option><option>Social Media</option>
                        </select>
                        <button onClick={handleDraft} disabled={isLoading} className="draft-button">
                            {isLoading ? <div className="loader-small"/> : <Icons.Wand2 size={16}/>}
                            Draft
                        </button>
                    </div>
                    <textarea value={draft} onChange={e => setDraft(e.target.value)} className="comms-textarea" rows={4} placeholder="Generated communication draft will appear here..." />
                </div>
                
                {/* Actions Grid */}
                <div className="actions-grid">
                    <button className="action-button red" onClick={() => requestConfirmation(
                        'Confirm Lockdown',
                        'This will send immediate alerts and lock exterior doors. Are you sure?',
                        'Confirm Lockdown',
                        'confirm-red',
                        () => handleAction('Initiate Lockdown', 'lockdown')
                    )}>
                        <Icons.Siren size={24}/><span>Initiate Lockdown</span>
                    </button>
                    <button className="action-button yellow" onClick={() => requestConfirmation(
                        'Confirm Mass Alert',
                        'This will send a pre-defined alert message to all parents and staff. Proceed?',
                        'Send Alert',
                        'confirm-yellow',
                        () => handleAction('Send Mass Alert', 'alert')
                    )}>
                        <Icons.Megaphone size={24}/><span>Send Mass Alert</span>
                    </button>
                    <button className="action-button blue">
                        <Icons.BookOpen size={24}/><span>View Protocols</span>
                    </button>
                    <button className="action-button green" onClick={() => requestConfirmation(
                        'Confirm All Clear',
                        'This will signal that the situation is resolved and normal operations can resume.',
                        'Signal All Clear',
                        'confirm-green',
                        () => handleAction('Signal "All Clear"', 'clear')
                    )}>
                        <Icons.CheckCircle size={24}/><span>Signal "All Clear"</span>
                    </button>
                </div>
                
                {/* Send Button */}
                <button className="send-communication-btn" disabled={!draft}><Icons.Send size={18}/> Send Communication</button>
            </div>
        </div>
    </div>
    {confirmationModal?.isOpen && (
            <div className="modal-backdrop">
                <div className="modal-content crisis-modal" onClick={e => e.stopPropagation()}>
                    <h3 className="modal-header">{confirmationModal.title}</h3>
                    <p className="modal-message">{confirmationModal.message}</p>
                    <div className="modal-actions">
                        <button onClick={closeConfirmationModal} className="modal-btn cancel-btn">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                confirmationModal.onConfirm();
                                closeConfirmationModal();
                            }}
                            className={`modal-btn ${confirmationModal.confirmColor}`}
                        >
                            {confirmationModal.confirmText}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default CrisisManagementHub;
