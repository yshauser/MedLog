// src/components/Navigation.tsx
import { Home, CalendarCheck2, Pill, Users, ScrollText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'בית', path: '/' },
    { icon: ScrollText, label: 'תיעוד', path: '/log' },
    { icon: CalendarCheck2, label: 'תקופתי', path: '/scheduled' },
    { icon: Pill, label: 'תרופות', path: '/medicines' },
    { icon: Users, label: 'ילדים', path: '/kids' }
  ];

  return (
    <footer className="border-t bg-white">
      <nav className="flex justify-between items-center p-4 max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button 
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname === path 
                ? 'text-emerald-700 font-medium' 
                : 'text-emerald-600 hover:text-emerald-700'
            }`}
            aria-label={label}
          >
            <Icon size={24} />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </nav>
    </footer>
  );
};