import React from 'react';
import { GISDashboard } from './GISDashboard';

// Preserve export compatibility for App.tsx and routing layers
export const GISExplorer: React.FC = () => {
  return <GISDashboard />;
};

export { GISDashboard };
