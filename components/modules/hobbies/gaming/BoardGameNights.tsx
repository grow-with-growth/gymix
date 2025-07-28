
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const BoardGameNights: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Board Game Nights"
        breadcrumbs="Gaming / Board Game Nights"
        icon={<Icons.BoardGameNights size={64} />}
    />
  );
};

export default BoardGameNights;
