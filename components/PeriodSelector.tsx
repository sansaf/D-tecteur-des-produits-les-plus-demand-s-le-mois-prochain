import React from 'react';
import { useI18n } from '../hooks/useI18n';

interface PeriodSelectorProps {
  selectedPeriod: number;
  onPeriodChange: (period: number) => void;
  disabled?: boolean;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange, disabled = false }) => {
  const { t } = useI18n();

  const periods = [
    { label: t('periodSelector.month', { count: 1 }), value: 1 },
    { label: t('periodSelector.month', { count: 3 }), value: 3 },
    { label: t('periodSelector.month', { count: 6 }), value: 6 },
  ];

  return (
    <div className="flex justify-center items-center bg-gray-800/60 rounded-full p-1.5 backdrop-blur-sm border border-gray-700/50 shadow-inner">
      {periods.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onPeriodChange(value)}
          disabled={disabled}
          aria-pressed={selectedPeriod === value}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed
            ${selectedPeriod === value 
              ? 'bg-cyan-500 text-white shadow-md' 
              : 'text-gray-300 hover:bg-gray-700/50'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;