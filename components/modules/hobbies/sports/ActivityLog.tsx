
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const ActivityLog: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Activity Log"
        breadcrumbs="Sports & Fitness / Activity Log"
        icon={<Icons.ActivityLog size={64} />}
    />
  );
};

export default ActivityLog;
