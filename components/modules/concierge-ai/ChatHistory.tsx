
import React from 'react';
import { Icons } from '../../icons';
import ConciergeContentPlaceholder from './ConciergeContentPlaceholder';

const ChatHistory: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Chat History"
        icon={<Icons.History size={64} />}
    />
  );
};

export default ChatHistory;
