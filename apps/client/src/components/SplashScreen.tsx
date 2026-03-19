import React from 'react';
import { Heart, Pill } from 'lucide-react';

interface SplashScreenProps {
  isVisible: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 animate-fadeIn">
      <div className="text-center">
        <div className="relative mb-8 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white/20 rounded-full animate-ping"></div>
          </div>
          
          <div className="relative flex items-center justify-center w-32 h-32 mx-auto bg-white rounded-full shadow-2xl">
            <div className="flex items-center gap-2">
              <Heart className="w-12 h-12 text-red-500 animate-heartbeat" fill="currentColor" />
              <Pill className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-2 animate-slideUp" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          תרופותי
        </h1>
        <p className="text-xl text-emerald-100 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          ניהול ותיעוד תרופות משפחתי
        </p>

        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};
