
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const MusicStudio: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Music Studio"
        breadcrumbs="Creative / Music Studio"
        icon={<Icons.MusicStudio size={64} />}
    />
  );
};

export default MusicStudio;
