import React, { useState } from 'react';
import { Menu, LogOut, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarCheck2, Pill, PillBottle, Users, UserCog, ScrollText, Settings } from 'lucide-react';
import { useAuth } from '../Users/AuthContext';
import LoginDialog from './LoginDialog';

interface SubMenuItem {
  icon?: React.FC<{ className?:string}>;
  label: string;
  path: string;
}

interface MenuItem {
  icon: React.FC<{ className?: string }>;
  label: string;
  path?: string;
  submenu?: SubMenuItem[];
}

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsSubmenu, setShowSettingsSubmenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'בית', path: '/' },
    { icon: ScrollText, label: 'תיעוד', path: '/log' },
    { icon: CalendarCheck2, label: 'תקופתי', path: '/scheduled' },
    { icon: Pill, label: 'תרופות', path: '/medicines' },
    { icon: Users, label: 'ילדים', path: '/kids' },
    { icon: Settings, label: 'הגדרות', 
      submenu: [
        {icon: PillBottle, label: 'ניהול תרופות', path: '/settings/medicines'},
        {icon: UserCog, label: 'ניהול משתמשים', path: '/settings/users'}
      ]
    }
  ];

  const handleLogout = () => {
    // logout();
    console.log ('*** handle logout', {user})
    setShowLoginModal(true);
  };

  const handleMenuItemClick = (path: string|undefined, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      setShowSettingsSubmenu(!showSettingsSubmenu);
    } else if (path) {
      navigate(path);
      setIsOpen(false);
      setShowSettingsSubmenu(false);
    }
  };

  return (
    <div className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-emerald-600 hover:text-emerald-700 p-2"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center">
            <span className="text-xl font-bold text-emerald-600">תרופותי</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600">{user?.username || 'אורח'}</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex-1 py-6 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {menuItems.map(({ icon: Icon, label, path, submenu }) => (
                    <div key={label}>
                      <button
                        onClick={() => handleMenuItemClick(path, !!submenu)}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          location.pathname === path
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-emerald-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                        {submenu && <ChevronLeft className={`ml-auto h-4 w-4 transform transition-transform ${showSettingsSubmenu ? 'rotate-90' : ''}`} />}
                      </button>

                      {submenu && showSettingsSubmenu && (
                        <div className="pl-8 space-y-1">
                          {submenu.map((subItem) => (
                            <button
                              key={subItem.label}
                              onClick={() => handleMenuItemClick(subItem.path, false)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50"
                            >
                              {subItem.icon && <subItem.icon className="h-5 w-5"/>}
                              <span>{subItem.label}</span>
                            </button>
                          ))}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50"
                            >
                            <LogOut className="h-5 w-5" />
                            <span>החלף משתמש</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && <LoginDialog onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default Header;
