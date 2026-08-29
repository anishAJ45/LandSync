import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading LandSync records...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div id="loading-spinner-container" className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 id="loading-spinner-icon" className={`animate-spin text-teal-600 ${sizeClasses[size]}`} />
      {message && (
        <p id="loading-spinner-text" className="text-sm font-medium text-slate-600 tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
};
