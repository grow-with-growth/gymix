
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const Wishlist: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Wishlist"
        breadcrumbs="Collecting / Wishlist"
        icon={<Icons.Wishlist size={64} />}
    />
  );
};

export default Wishlist;
