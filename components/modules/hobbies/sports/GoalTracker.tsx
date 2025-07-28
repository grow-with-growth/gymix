
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const GoalTracker: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Goal Tracker"
        breadcrumbs="Sports & Fitness / Goal Tracker"
        icon={<Icons.GoalTracker size={64} />}
    />
  );
};

export default GoalTracker;
