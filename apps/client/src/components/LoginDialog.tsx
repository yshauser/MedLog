import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Users/AuthContext';

const LoginDialog = ({ onClose }: { onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleLogin = () => {
    if (username.trim()) {
      const result = login(username);
      if (result.success) {
        onClose();
      } else {
        setError(result.message || 'התחברות נכשלה');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'כניסה עם Google נכשלה');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4 text-center">התחבר</h2>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? 'מתחבר...' : 'כניסה עם Google'}
        </button>

        {import.meta.env.VITE_APP_ENV !== 'production' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">או משתמש בדיקה</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Test user username login */}
            <input
              type="text"
              placeholder="הכנס שם משתמש"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="border p-2 w-full rounded mb-2"
            />

            <div className="flex justify-center gap-3 mt-2">
              <button
                onClick={handleLogin}
                disabled={!username.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-40"
              >
                כניסה
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">ביטול</button>
            </div>
          </>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Registration Link */}
        <div className="text-center text-sm text-gray-600 mt-4">
          אין לך חשבון?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            הירשם כאן
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;
