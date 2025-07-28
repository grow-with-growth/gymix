
import React from 'react';
import { Icons } from '../../icons';
import ConciergeContentPlaceholder from './ConciergeContentPlaceholder';

const Translator: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Translator"
        icon={<Icons.Globe size={64} />}
    />
  );
};

export default Translator;
