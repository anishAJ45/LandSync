import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message,
  onRetry
}) => {
  return (
    <div
      id="error-alert-banner"
      className="p-4 rounded-xl border border-red-200 bg-red-50/80 text-red-900 flex items-start gap-3 shadow-xs"
    >
      <AlertCircle id="error-icon" className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <h4 id="error-heading" className="font-semibold text-red-950">{title}</h4>
        <p id="error-details" className="text-red-800 mt-1">{message}</p>
        {onRetry && (
          <button
            id="error-retry-btn"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Request
          </button>
        )}
      </div>
    </div>
  );
};
