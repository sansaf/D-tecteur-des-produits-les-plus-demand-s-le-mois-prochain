import React from 'react';
import { useI18n } from '../hooks/useI18n';

const LoadingSpinner: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      <p className="text-lg text-blue-300 font-semibold">{t('spinner.loading')}</p>
    </div>
  );
};

export default LoadingSpinner;