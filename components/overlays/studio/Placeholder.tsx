
import React from 'react';

const StudioPlaceholder: React.FC<{ appName: string }> = ({ appName }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
      <h2 className="font-orbitron text-3xl font-bold text-white mb-2">{appName}</h2>
      <p>Content for {appName} will be available here.</p>
    </div>
  );
};

export default StudioPlaceholder;