
import React from 'react';
import { Icons } from '../../icons';
import ConciergeContentPlaceholder from './ConciergeContentPlaceholder';

const ProductivityPrompts: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Productivity Prompts"
        icon={<Icons.Sparkles size={64} />}
    />
  );
};

export default ProductivityPrompts;
