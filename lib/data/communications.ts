import {
    EmailFolder,
    Email,
} from '../../types';
import { getData } from '../utils';

export const dbEmailFolders: EmailFolder[] = [
    { name: 'Inbox', icon: 'Inbox', count: 12 },
    { name: 'Sent', icon: 'Send', count: 0 },
    { name: 'Drafts', icon: 'FileText', count: 2 },
    { name: 'Archive', icon: 'Archive', count: 0 },
    { name: 'Spam', icon: 'ShieldX', count: 3 },
    { name: 'Trash', icon: 'Trash2', count: 0 },
];

export const dbEmails: Email[] = [
    { id: 1, sender: 'Google', subject: 'Security alert', snippet: 'A new device signed into your account...', time: '2:45 PM', unread: true, body: "Hi there,\n\nWe noticed a new sign-in to your Google Account on a Windows device. If this was you, you don’t need to do anything. If not, we’ll help you secure your account.\n\nThanks,\nThe Google Team", folder: 'Inbox' },
    { id: 2, sender: 'Figma', subject: 'Updates to our collaboration tools', snippet: 'Work better, together. See what\'s new...', time: '1:10 PM', unread: true, body: "Hello,\n\nGet ready to streamline your design workflow with our latest updates. We've introduced real-time cursors and improved commenting to make collaboration seamless.\n\nCheck out the blog post for more details.\n\nBest,\nThe Figma Team", folder: 'Inbox' },
    { id: 3, sender: 'Notion', subject: 'Your weekly digest', snippet: 'Here are the top pages your team...', time: '9:00 AM', unread: false, body: "Here's what your team has been up to this week:\n- Marketing Plan Q3: 5 updates\n- Project Phoenix Spec: 12 edits\n\nStay productive!\n- The Notion Team", folder: 'Inbox' },
    { id: 4, sender: 'Jane Doe', subject: 'Project Phoenix Files', snippet: 'Hey, I\'ve attached the files we discussed...', time: 'Yesterday', unread: false, body: "Hi,\n\nAs promised, I've attached the initial design mockups for Project Phoenix. Let me know what you think when you have a moment.\n\nBest,\nJane", folder: 'Inbox' },
    { id: 5, sender: 'Vercel', subject: 'Deployment successful!', snippet: 'Your project `saas-school` was deployed...', time: 'Yesterday', unread: false, body: "Congratulations!\n\nYour project `saas-school` has been successfully deployed. You can view it live at saas-school.vercel.app.\n\nHappy coding!", folder: 'Inbox' },
    { id: 6, sender: 'Yourself', subject: '[Draft] Marketing Proposal', snippet: 'Hi team, here is the draft for the Q4 marketing...', time: '3 days ago', unread: false, body: 'Hi team,\n\nHere is the draft for the Q4 marketing proposal. Please provide feedback by EOD Friday.\n\nThanks!', folder: 'Drafts'},
    { id: 7, sender: 'Yourself', subject: '[Draft] Follow-up with Acme Corp', snippet: 'Hi John, just following up on our conversation...', time: '4 days ago', unread: false, body: 'Hi John,\n\nJust following up on our conversation last week regarding the partnership opportunity. Are you free for a quick chat tomorrow?\n\nBest,', folder: 'Drafts'},
    { id: 8, sender: 'BitPharma', subject: 'Your prescription is ready for pickup', snippet: 'Claim your meds now and get a discount...', time: '11:20 AM', unread: true, body: 'DO NOT MISS THIS EXCLUSIVE OFFER!', folder: 'Spam'},
];

export const fetchEmailFolders = () => getData(dbEmailFolders);
export const fetchEmails = (folder: string) => getData(dbEmails.filter(email => email.folder.toLowerCase() === folder.toLowerCase()));
