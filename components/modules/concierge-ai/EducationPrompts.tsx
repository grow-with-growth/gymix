
import React from 'react';
import { Icons } from '../../icons';
import ConciergeContentPlaceholder from './ConciergeContentPlaceholder';

const EducationPrompts: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Education Prompts"
        icon={<Icons.GraduationCap size={64} />}
    />
  );
};

export default EducationPrompts;
