
import React from 'react';
import { Icons } from '../../../icons';
import ConciergeContentPlaceholder from '../ConciergeContentPlaceholder';

const AIPersona: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Persona & Behavior"
        icon={<Icons.Smile size={64} />}
    />
  );
};

export default AIPersona;
