
import React from 'react';
import { Icons } from '../../icons';
import ConciergeContentPlaceholder from './ConciergeContentPlaceholder';

const AdminPrompts: React.FC = () => {
  return (
    <ConciergeContentPlaceholder 
        title="Administration Prompts"
        icon={<Icons.Shield size={64} />}
    />
  );
};

export default AdminPrompts;
