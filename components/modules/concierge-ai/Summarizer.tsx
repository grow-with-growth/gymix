
import React from 'react';
import { Icons } from '../../icons';
import ConciergeContentPlaceholder from './ConciergeContentPlaceholder';

const Summarizer: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Summarizer"
        icon={<Icons.FileText size={64} />}
    />
  );
};

export default Summarizer;
