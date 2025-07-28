
import React from 'react';
import { Icons } from '../../../icons';
import HobbiesDashboardPlaceholder from '../HobbiesDashboardPlaceholder';

const ArtGallery: React.FC = () => {
  return (
    <HobbiesDashboardPlaceholder
        title="Art Gallery"
        breadcrumbs="Creative / Art Gallery"
        icon={<Icons.ArtGallery size={64} />}
    />
  );
};

export default ArtGallery;
