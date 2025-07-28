
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const CollectionManager: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Collection Manager"
        breadcrumbs="Collecting / Collection Manager"
        icon={<Icons.CollectionManager size={64} />}
    />
  );
};

export default CollectionManager;
