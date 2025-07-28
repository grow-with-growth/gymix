
import React, { useState } from 'react';
import '../shared.css';
import './Announcements.css';
import { Icons } from '../../../icons';
import { GoogleGenAI } from '@google/genai';

type Category = 'General' | 'Events' | 'Academics' | 'Urgent';
type Audience = 'All' | 'Parents' | 'Students' | 'Staff';
type Tone = 'Formal' | 'Friendly' | 'Urgent';

interface Announcement {
    id: number;
    title: string;
    content: string;
    category: Category;
    audience: Audience;
    author: string;
    date: string;
    pinned: boolean;
}

const initialAnnouncements: Announcement[] = [
    { id: 1, title: "Parent-Teacher Conferences Next Week", date: "Oct 28, 2024", content: "Sign-ups are now open for parent-teacher conferences happening next week. Please check your email for the link to book your slot. We look forward to speaking with you about your child's progress.", author: "Admin", category: 'Events', audience: 'Parents', pinned: true },
    { id: 2, title: "School Spirit Day on Friday!", date: "Oct 25, 2024", content: "Don't forget to wear your school colors this Friday to show your spirit! Go Comets! There will be a prize for the most spirited class.", author: "Admin", category: 'General', audience: 'Students', pinned: false },
    { id: 3, title: "Library Book Fair", date: "Oct 22, 2024", content: "The annual book fair is running all this week in the main library. Come find your next favorite book and support our library programs. All proceeds go towards new acquisitions.", author: "Admin", category: 'Events', audience: 'All', pinned: false },
];

const categoryConfig = {
    'General': { icon: Icons.News, color: 'border-gray-500' },
    'Events': { icon: Icons.CalendarDays, color: 'border-blue-500' },
    'Academics': { icon: Icons.Book, color: 'border-green-500' },
    'Urgent': { icon: Icons.AlertTriangle, color: 'border-red-500' }
};

const Announcements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<Category>('General');
    const [audience, setAudience] = useState<Audience>('All');
    const [tone, setTone] = useState<Tone>('Friendly');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!title.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Write a school announcement.
            - Topic: "${title}"
            - Category: ${category}
            - Target Audience: ${audience}
            - Tone: ${tone}
            Make it clear, concise, and engaging.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            setContent(response.text);
        } catch (error) {
            console.error("AI generation error:", error);
            setContent("Error: Could not generate content.");
        }
        setIsLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        const newAnnouncement: Announcement = {
            id: Date.now(),
            title,
            content,
            category,
            audience,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: 'Admin',
            pinned: false,
        };
        setAnnouncements([newAnnouncement, ...announcements]);
        setTitle('');
        setContent('');
    };
    
    const togglePin = (id: number) => {
        setAnnouncements(announcements.map(a => a.id === id ? {...a, pinned: !a.pinned} : a));
    };

    const pinnedAnnouncements = announcements.filter(a => a.pinned);
    const regularAnnouncements = announcements.filter(a => !a.pinned);

  return (
    <div className="announcements-container">
        <div className="create-announcement-card">
            <h3 className="font-orbitron text-xl text-white mb-4">Create New Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group"><label>Category</label><select value={category} onChange={e => setCategory(e.target.value as Category)} className="form-input"><option>General</option><option>Events</option><option>Academics</option><option>Urgent</option></select></div>
                    <div className="form-group"><label>Audience</label><select value={audience} onChange={e => setAudience(e.target.value as Audience)} className="form-input"><option>All</option><option>Parents</option><option>Students</option><option>Staff</option></select></div>
                </div>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., 'Upcoming Bake Sale'" className="form-input" />
                </div>
                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <div className="relative">
                        <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Write your announcement here or generate with AI..." className="form-input" />
                        <div className="ai-controls">
                            <select value={tone} onChange={e=>setTone(e.target.value as Tone)} className="ai-tone-select"><option>Friendly</option><option>Formal</option><option>Urgent</option></select>
                            <button type="button" onClick={handleGenerate} disabled={isLoading || !title.trim()} className="ai-generate-btn">
                                {isLoading ? <div className="loader-small"></div> : <Icons.Wand2 size={16}/>} Generate
                            </button>
                        </div>
                    </div>
                </div>
                <button type="submit" className="submit-btn"><Icons.Send size={18} />Post Announcement</button>
            </form>
        </div>

        <div className="announcements-list-section">
            {pinnedAnnouncements.length > 0 && (
                <>
                    <h3 className="list-header"><Icons.Pin size={20}/> Pinned</h3>
                    <div className="announcements-list">
                        {pinnedAnnouncements.map(item => (
                             <AnnouncementCard key={item.id} item={item} togglePin={togglePin} expandedId={expandedId} setExpandedId={setExpandedId} />
                        ))}
                    </div>
                </>
            )}
            <h3 className="list-header"><Icons.News size={20}/> Recent</h3>
             <div className="announcements-list">
                {regularAnnouncements.map(item => (
                    <AnnouncementCard key={item.id} item={item} togglePin={togglePin} expandedId={expandedId} setExpandedId={setExpandedId} />
                ))}
            </div>
        </div>
    </div>
  );
};

interface CardProps {
    item: Announcement;
    togglePin: (id: number) => void;
    expandedId: number | null;
    setExpandedId: (id: number | null) => void;
}

const AnnouncementCard: React.FC<CardProps> = ({ item, togglePin, expandedId, setExpandedId }) => {
    const isExpanded = expandedId === item.id;
    const CategoryIcon = categoryConfig[item.category].icon;
    const categoryColor = categoryConfig[item.category].color;

    return (
        <div className={`announcement-item ${categoryColor}`}>
            <div className="item-icon"><CategoryIcon size={24}/></div>
            <div className="item-main">
                <h4 className="item-title">{item.title}</h4>
                <div className="item-meta">
                    <span>{item.author}</span> &middot; <span>{item.date}</span> &middot; <span>{item.audience}</span>
                </div>
                <p className={`item-content ${isExpanded ? 'expanded' : ''}`}>
                    {item.content}
                </p>
                {item.content.length > 150 && (
                    <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="read-more-btn">
                        {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                )}
            </div>
            <div className="item-actions">
                <button onClick={() => togglePin(item.id)} className={`action-btn ${item.pinned ? 'active' : ''}`}>
                    {item.pinned ? <Icons.PinOff size={16}/> : <Icons.Pin size={16}/>}
                </button>
                <button className="action-btn"><Icons.Edit size={16}/></button>
                <button className="action-btn delete"><Icons.Trash2 size={16}/></button>
            </div>
        </div>
    );
};

export default Announcements;
