
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const GameLibrary: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Game Library"
        breadcrumbs="Gaming / Game Library"
        icon={<Icons.GameLibrary size={64} />}
    />
  );
};

export default GameLibrary;
