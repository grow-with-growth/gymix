
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const GardenPlanner: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Garden Planner"
        breadcrumbs="Outdoors / Garden Planner"
        icon={<Icons.GardenPlanner size={64} />}
    />
  );
};

export default GardenPlanner;
