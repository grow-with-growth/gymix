
import React, { useState } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './communications-module.css';

const folders = [
  { id: 'inbox', name: 'Inbox', icon: <Icons.Communications size={16} />, count: 5 },
  { id: 'sent', name: 'Sent', icon: <Icons.ChevronRight size={16} />, count: 0 },
  { id: 'drafts', name: 'Drafts', icon: <Icons.Office size={16} />, count: 2 },
  { id: 'spam', name: 'Spam', icon: <Icons.Security size={16} />, count: 12 },
  { id: 'trash', name: 'Trash', icon: <Icons.Cloud size={16} />, count: 34 },
];

const emails = [
  { id: 1, from: 'Figma', subject: 'New comment on your design', time: '10:32 AM', read: false },
  { id: 2, from: 'GitHub', subject: '[grow-your-need] PR #12 approved', time: '10:28 AM', read: false },
  { id: 3, from: 'Vercel', subject: 'Deployment successful', time: '9:55 AM', read: true },
  { id: 4, from: 'Linear', subject: 'New issue assigned to you', time: '9:40 AM', read: false },
  { id: 5, from: 'Alice', subject: 'Project Update Meeting', time: 'Yesterday', read: true },
  { id: 6, from: 'Bob', subject: 'Re: Lunch plans?', time: 'Yesterday', read: true },
];

const CommunicationsModule: React.FC = () => {
  const [selectedEmailId, setSelectedEmailId] = useState<number>(2);
  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  return (
    <GlassmorphicContainer className="communications-module-bordered w-full h-full flex rounded-2xl overflow-hidden">
      {/* Pane 1: Folders */}
      <div className="w-[240px] bg-white/5 p-2 flex flex-col shrink-0 comms-folder-pane-bordered">
        <div className="p-2 mb-2">
            <button className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">
                Compose
            </button>
        </div>
        <nav className="flex flex-col gap-1">
          {folders.map(folder => (
            <a
              key={folder.id}
              href="#"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${folder.id === 'inbox' ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                {folder.icon}
                <span>{folder.name}</span>
              </div>
              {folder.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${folder.id === 'inbox' ? 'bg-cyan-400 text-black' : 'bg-gray-600 text-gray-200'}`}>
                  {folder.count}
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>
      {/* Pane 2: Email List */}
      <div className="w-[320px] bg-white/10 flex flex-col shrink-0 overflow-y-auto comms-email-list-pane-bordered">
        {emails.map(email => (
          <button
            key={email.id}
            onClick={() => setSelectedEmailId(email.id)}
            className={`w-full text-left p-3 transition-colors relative comms-email-item-bordered ${selectedEmailId === email.id ? 'bg-purple-900/50' : 'hover:bg-white/5'}`}
          >
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
              <span>{email.from}</span>
              <span>{email.time}</span>
            </div>
            <p className={`font-semibold truncate ${email.read ? 'text-gray-300' : 'text-white'}`}>{email.subject}</p>
            {!email.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full"></div>}
          </button>
        ))}
      </div>
      {/* Pane 3: Reading Pane */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {selectedEmail ? (
          <>
            <h1 className="font-orbitron text-2xl font-bold text-white mb-2">{selectedEmail.subject}</h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-fuchsia-500 rounded-full flex items-center justify-center font-bold text-white">
                {selectedEmail.from.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-white">{selectedEmail.from}</p>
                <p className="text-sm text-gray-400">to Me</p>
              </div>
              <span className="ml-auto text-sm text-gray-500">{selectedEmail.time}</span>
            </div>
            <div className="prose prose-invert prose-sm text-gray-300 max-w-none">
              <p>Hello,</p>
              <p>This is a placeholder for the email content. The pull request #12 in the 'grow-your-need' repository has been approved and merged.</p>
              <p>You can view the changes on GitHub. No further action is required from your side.</p>
              <p>Best regards,<br/>GitHub Notifier</p>
            </div>
          </>
        ) : (
          <div className="m-auto text-center text-gray-500">
            <Icons.Communications size={48} className="mx-auto mb-4" />
            <p>Select an email to read</p>
          </div>
        )}
      </div>
    </GlassmorphicContainer>
  );
};

export default CommunicationsModule;