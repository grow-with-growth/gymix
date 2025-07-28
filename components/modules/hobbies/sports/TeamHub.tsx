
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const TeamHub: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Team Hub"
        breadcrumbs="Sports & Fitness / Team Hub"
        icon={<Icons.TeamHub size={64} />}
    />
  );
};

export default TeamHub;
