import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icons } from '../../../icons';
import './ParentCommunication.css';

// --- MOCK DATA ---
const teachers = [
  { id: 1, name: 'Ms. Davis', subject: 'Mathematics', avatarColor: 'bg-blue-500', isOnline: true },
  { id: 2, name: 'Mr. Chen', subject: 'History', avatarColor: 'bg-green-500', isOnline: false },
  { id: 3, name: 'Mrs. Ortega', subject: 'Science', avatarColor: 'bg-yellow-500', isOnline: true },
];

const initialMessages = [
  { id: 1, teacherId: 1, author: 'Ms. Davis', text: 'Hola! Solo un recordatorio de que la tarea de álgebra vence mañana.', timestamp: '10:45 AM', translatedText: null, isTranslating: false },
  { id: 2, teacherId: 1, author: 'Parent', text: 'Thank you for the reminder!', timestamp: '10:46 AM' },
  { id: 3, teacherId: 1, author: 'Ms. Davis', text: 'De nada! Que tengas un buen día.', timestamp: '10:47 AM', translatedText: null, isTranslating: false },
];
// --- END MOCK DATA ---


type Message = {
    id: number;
    teacherId: number;
    author: string;
    text: string;
    timestamp: string;
    translatedText?: string | null;
    isTranslating?: boolean;
};

const ParentCommunication: React.FC = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  
  // New state for enhancements
  const [searchTerm, setSearchTerm] = useState('');
  const [isDraftingModalOpen, setIsDraftingModalOpen] = useState(false);
  const [draftIntent, setDraftIntent] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftingError, setDraftingError] = useState('');


  const handleTranslate = async (messageId: number, textToTranslate: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isTranslating: true, translatedText: null } : m));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text to English, providing only the translation: "${textToTranslate}"`,
      });
      const translated = response.text;
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isTranslating: false, translatedText: translated } : m));
    } catch (error) {
      console.error("Translation error:", error);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isTranslating: false, translatedText: 'Error: Could not translate.' } : m));
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim()) return;
      const newMsg: Message = {
          id: Date.now(),
          teacherId: selectedTeacherId,
          author: 'Parent',
          text: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
  };

    const handleGenerateDraft = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draftIntent.trim() || isDrafting) return;
        
        setIsDrafting(true);
        setDraftingError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are a parent communicating with your child's teacher. Rewrite the following rough parent query into a polite, clear, and respectful message suitable for sending to a teacher. The message should be friendly but professional. Keep it concise.

Parent's goal: "${draftIntent}"`;
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setNewMessage(response.text);
            setIsDraftingModalOpen(false);
            setDraftIntent('');
        } catch(err) {
            console.error("AI draft generation error:", err);
            setDraftingError("Sorry, I couldn't generate a draft. Please try again.");
        } finally {
            setIsDrafting(false);
        }
  };


  const filteredTeachers = useMemo(() => 
    teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  const conversationMessages = messages.filter(m => m.teacherId === selectedTeacherId);

  return (
    <>
    <div className="parent-comms-container">
      {/* Teacher List */}
      <div className="parent-comms-sidebar">
        <h2 className="parent-comms-sidebar-header">Teachers</h2>
        <div className="parent-comms-sidebar-search">
            <input 
                type="text"
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="sidebar-search-input"
            />
        </div>
        <div className="parent-comms-teacher-list">
          {filteredTeachers.map(teacher => (
            <button 
              key={teacher.id} 
              className={`teacher-contact-btn ${teacher.id === selectedTeacherId ? 'active' : ''}`}
              onClick={() => setSelectedTeacherId(teacher.id)}
            >
              <div className="relative">
                <div className={`teacher-avatar ${teacher.avatarColor}`}>{teacher.name.charAt(0)}</div>
                <div className={`online-status-dot ${teacher.isOnline ? 'online' : 'offline'}`}></div>
              </div>
              <div className="teacher-info">
                <p className="teacher-name">{teacher.name}</p>
                <p className="teacher-subject">{teacher.subject}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Pane */}
      <div className="parent-comms-chat-pane">
        <div className="chat-pane-header">
          <h3 className="font-orbitron text-xl font-bold text-white">{selectedTeacher?.name}</h3>
          <p className="text-sm text-gray-400">{selectedTeacher?.subject}</p>
        </div>
        <div className="chat-pane-messages">
            {conversationMessages.map(msg => (
                <div key={msg.id} className={`chat-bubble-wrapper ${msg.author === 'Parent' ? 'parent' : 'teacher'}`}>
                    <div className="chat-bubble">
                        <p className="message-text">{msg.text}</p>
                        {msg.author !== 'Parent' && (
                             <div className="translation-area">
                                {msg.translatedText && <p className="translated-text">{msg.translatedText}</p>}
                                <button 
                                    onClick={() => handleTranslate(msg.id, msg.text)} 
                                    className="translate-btn"
                                    disabled={msg.isTranslating}
                                >
                                    {msg.isTranslating ? 'Translating...' : 'Translate'}
                                    <Icons.AIHelper size={14} className="ml-1" />
                                </button>
                             </div>
                        )}
                        <span className="message-timestamp">{msg.timestamp}</span>
                    </div>
                </div>
            ))}
        </div>
        <div className="chat-pane-input-area">
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="chat-input-wrapper">
                <button type="button" className="ai-draft-btn" onClick={() => setIsDraftingModalOpen(true)} title="Draft with AI">
                    <Icons.Wand2 size={20}/>
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedTeacher?.name}...`}
                    className="chat-input"
                />
            </div>
            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
              <Icons.Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
    {isDraftingModalOpen && (
        <div className="draft-modal-backdrop" onClick={() => setIsDraftingModalOpen(false)}>
            <div className="draft-modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="draft-modal-header"><Icons.Wand2/> AI Message Draft</h3>
                <p className="text-gray-400 text-center">Describe what you want to say, and AI will write a polite message for you.</p>
                <form onSubmit={handleGenerateDraft}>
                    <input 
                        type="text"
                        value={draftIntent}
                        onChange={e => setDraftIntent(e.target.value)}
                        placeholder="e.g., 'ask about my son's missing homework'"
                        className="draft-modal-input"
                    />
                     {draftingError && <p className="draft-modal-error">{draftingError}</p>}
                    <button type="submit" className="draft-modal-btn mt-4" disabled={isDrafting || !draftIntent.trim()}>
                        {isDrafting ? <div className="loader-small"/> : 'Generate Draft'}
                    </button>
                </form>
            </div>
        </div>
    )}
    </>
  );
};

export default ParentCommunication;