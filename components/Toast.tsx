import React, { useEffect } from 'react';
import { MailIcon, CheckCircleIcon } from './IconComponents';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'info' | 'success';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'info' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);
  
  const styles = {
    info: {
      bg: 'bg-green-600/90',
      icon: <MailIcon className="w-6 h-6" />
    },
    success: {
      bg: 'bg-cyan-600/90',
      icon: <CheckCircleIcon className="w-6 h-6" />
    }
  }

  const currentStyle = styles[type];

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${currentStyle.bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in-up z-50`}>
      {currentStyle.icon}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Toast;