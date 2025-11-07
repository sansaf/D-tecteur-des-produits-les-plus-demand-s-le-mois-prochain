import React from 'react';

type ToggleValue = 'reliable' | 'creative';

interface ToggleOption {
  label: string;
  value: ToggleValue;
}

interface ToggleSwitchProps {
  value: ToggleValue;
  onChange: (value: ToggleValue) => void;
  option1: ToggleOption;
  option2: ToggleOption;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onChange,
  option1,
  option2,
  disabled = false
}) => {
  return (
    <div className={`relative flex w-full max-w-xs items-center justify-between rounded-full bg-gray-900/70 p-1.5 border border-gray-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <span
        className={`absolute top-1/2 left-1.5 h-[calc(100%-0.75rem)] w-[calc(50%-0.375rem)] -translate-y-1/2 rounded-full bg-cyan-500 shadow-md transition-transform duration-300 ease-in-out ${
          value === option2.value ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      <button
        type="button"
        onClick={() => !disabled && onChange(option1.value)}
        className={`relative z-10 w-1/2 rounded-full py-1 text-center text-sm font-semibold transition-colors duration-300 ${
          value === option1.value ? 'text-white' : 'text-gray-300 hover:text-white'
        }`}
        disabled={disabled}
      >
        {option1.label}
      </button>
      <button
        type="button"
        onClick={() => !disabled && onChange(option2.value)}
        className={`relative z-10 w-1/2 rounded-full py-1 text-center text-sm font-semibold transition-colors duration-300 ${
          value === option2.value ? 'text-white' : 'text-gray-300 hover:text-white'
        }`}
        disabled={disabled}
      >
        {option2.label}
      </button>
    </div>
  );
};

export default ToggleSwitch;
