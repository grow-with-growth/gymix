
import React from 'react';
import { Icons } from '../../icons';
import ConciergeContentPlaceholder from './ConciergeContentPlaceholder';

const ContentGenerator: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Content Generator"
        icon={<Icons.Wand2 size={64} />}
    />
  );
};

export default ContentGenerator;
