
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const TrailFinder: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Trail Finder"
        breadcrumbs="Outdoors / Trail Finder"
        icon={<Icons.TrailFinder size={64} />}
    />
  );
};

export default TrailFinder;
