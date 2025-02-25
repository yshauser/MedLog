import React, { useState } from 'react';
import { useAuth } from '../Users/AuthContext';

const LoginDialog = ({ onClose }: { onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login} = useAuth();

  const handleLogin = () => {
    // console.log ('*** handle login', {username})
    if (username.trim()) {
      const result = login (username);
      if (result.success){
        onClose();
      }else{
        setError(result.message || 'התחברות נכשלה');
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">התחבר</h2>
        <input
          type="text"
          placeholder="הכנס שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full"
        />
        {error && (
          <p className="text-red-500 mb-2">{error}</p>
        )}
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={handleLogin} className="px-4 py-2 bg-emerald-600 text-white rounded">כניסה</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">ביטול</button>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;
