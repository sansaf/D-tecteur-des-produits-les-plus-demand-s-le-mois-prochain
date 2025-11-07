import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { XIcon } from './IconComponents';
import { useI18n } from '../hooks/useI18n';

interface UserSettingsModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, user, onClose, onSave }) => {
  const { t } = useI18n();
  const [email, setEmail] = useState(user.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled || false);

  useEffect(() => {
    if (isOpen) {
        setEmail(user.email || '');
        setNotificationsEnabled(user.notificationsEnabled || false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...user,
      email,
      notificationsEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="usersettings-modal-title">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-down">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 id="usersettings-modal-title" className="text-2xl font-bold text-cyan-400">{t('userSettings.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              {t('userSettings.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('userSettings.emailPlaceholder')}
              className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center">
            <input
              id="notifications"
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="notifications" className="ml-3 block text-sm font-medium text-gray-300">
              {t('userSettings.notificationsLabel')}
            </label>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 border-t border-gray-700 text-right rounded-b-2xl">
           <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors mr-4"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
          >
            {t('userSettings.saveButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsModal;