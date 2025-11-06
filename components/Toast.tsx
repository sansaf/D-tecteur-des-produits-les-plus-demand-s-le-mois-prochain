import React, { useEffect } from 'react';
import { MailIcon } from './IconComponents';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600/90 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in-up z-50">
      <MailIcon className="w-6 h-6" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Toast;
