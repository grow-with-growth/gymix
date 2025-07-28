
import React from 'react';
import { Icons } from '../../../icons';
import ConciergeContentPlaceholder from '../ConciergeContentPlaceholder';

const AIDataPrivacy: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Data & Privacy"
        icon={<Icons.Security size={64} />}
    />
  );
};

export default AIDataPrivacy;
