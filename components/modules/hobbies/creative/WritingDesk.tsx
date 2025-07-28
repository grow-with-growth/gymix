
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const WritingDesk: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Writing Desk"
        breadcrumbs="Creative / Writing Desk"
        icon={<Icons.WritingDesk size={64} />}
    />
  );
};

export default WritingDesk;
