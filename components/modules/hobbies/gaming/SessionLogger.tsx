
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const SessionLogger: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Session Logger"
        breadcrumbs="Gaming / Session Logger"
        icon={<Icons.SessionLogger size={64} />}
    />
  );
};

export default SessionLogger;
