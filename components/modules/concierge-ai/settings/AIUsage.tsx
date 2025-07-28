
import React from 'react';
import { Icons } from '../../../icons';
import ConciergeContentPlaceholder from '../ConciergeContentPlaceholder';

const AIUsage: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Usage & Limits"
        icon={<Icons.BarChart3 size={64} />}
    />
  );
};

export default AIUsage;
