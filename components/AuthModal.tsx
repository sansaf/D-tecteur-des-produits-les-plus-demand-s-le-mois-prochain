import React, { useState } from 'react';
import { User } from '../types';
import { XIcon, MailIcon, LockClosedIcon, UserIcon, GoogleIcon } from './IconComponents';
import { useI18n } from '../hooks/useI18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

type AuthView = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const { t } = useI18n();
  const [view, setView] = useState<AuthView>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const dbString = localStorage.getItem('user-database');
    const db = dbString ? JSON.parse(dbString) : {};

    if (view === 'signup') {
      if (db[email]) {
        setError(t('authModal.signupError'));
        return;
      }
      const newUser = {
        name,
        email,
        password, // NOTE: Storing password in plaintext is for demo purposes ONLY.
        subscription: 'free' as const,
        picture: `https://api.dicebear.com/8.x/avataaars/svg?seed=${name.replace(/\s/g, '-')}`
      };
      db[email] = newUser;
      localStorage.setItem('user-database', JSON.stringify(db));
      const { password: _, ...userForSession } = newUser;
      onAuthSuccess(userForSession);
    } else { // login
      const storedUser = db[email];
      if (!storedUser || storedUser.password !== password) {
        setError(t('authModal.loginError'));
        return;
      }
      const { password: _, ...userForSession } = storedUser;
      onAuthSuccess(userForSession);
    }
  };
  
  const handleGoogleLogin = () => {
    // Simulate Google login
    const googleProfile = {
      name: 'Alex Doe',
      email: 'alex.doe@example.com',
      picture: `https://api.dicebear.com/8.x/initials/svg?seed=Alex Doe`
    };

    const dbString = localStorage.getItem('user-database');
    const db = dbString ? JSON.parse(dbString) : {};
    
    let userForSession;

    if (db[googleProfile.email]) {
        // User exists, log them in
        const { password: _, ...existingUser } = db[googleProfile.email];
        userForSession = existingUser;
    } else {
        // New user, sign them up
        const newUser = {
          ...googleProfile,
          subscription: 'free' as const,
        };
        const userToStore = { ...newUser, password: 'google-provided' }; // Add mock password for consistency
        db[googleProfile.email] = userToStore;
        localStorage.setItem('user-database', JSON.stringify(db));
        userForSession = newUser;
    }
    
    onAuthSuccess(userForSession);
  };

  const toggleView = () => {
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
    setView(view === 'login' ? 'signup' : 'login');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-down">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 id="auth-modal-title" className="text-2xl font-bold text-cyan-400">
            {view === 'login' ? t('authModal.loginTitle') : t('authModal.signupTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XIcon className="w-7 h-7" />
          </button>
        </div>
        <form onSubmit={handleAuth}>
          <div className="p-8 space-y-6">
            {view === 'signup' && (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('authModal.nameLabel')}
                  required
                  className="w-full bg-gray-900/70 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            )}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MailIcon className="w-5 h-5 text-gray-500" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('authModal.emailLabel')}
                required
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="w-5 h-5 text-gray-500" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('authModal.passwordLabel')}
                required
                minLength={6}
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          </div>
          <div className="bg-gray-800/50 p-6 border-t border-gray-700 rounded-b-2xl">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
            >
              {view === 'login' ? t('authModal.loginButton') : t('authModal.signupButton')}
            </button>
            <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">{t('authModal.orDivider')}</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
             <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
                <GoogleIcon className="w-5 h-5" />
                {t('authModal.googleLogin')}
            </button>
            <p className="text-center text-sm mt-4">
              <button type="button" onClick={toggleView} className="text-cyan-400 hover:underline">
                {view === 'login' ? t('authModal.switchToSignup') : t('authModal.switchToLogin')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;