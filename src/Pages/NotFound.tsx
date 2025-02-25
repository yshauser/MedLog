// src/Pages/NotFound/NotFoundPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
      <p className="text-gray-500 mb-8">
        מה נסגר איתך? מנסה להקליד כתובות לא קיימות ??
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Go Home
      </button>
    </div>
  );
};