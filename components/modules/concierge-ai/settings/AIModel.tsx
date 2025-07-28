
import React from 'react';
import { Icons } from '../../../icons';
import ConciergeContentPlaceholder from '../ConciergeContentPlaceholder';

const AIModel: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Model & Performance"
        icon={<Icons.Cpu size={64} />}
    />
  );
};

export default AIModel;
