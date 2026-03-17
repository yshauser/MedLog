import React, { useState , useRef} from 'react';
import { Menu, LogOut, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarCheck2, Pill, PillBottle, Users, UserCog, ScrollText, Settings, Info } from 'lucide-react';
import { useAuth } from '../Users/AuthContext';
import LoginDialog from './LoginDialog';
import AboutDialog from './AboutDialog';
import ilFlag from '../assets/flags/il.svg';
import ukFlag from '../assets/flags/uk.svg';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const [isLangOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState<'he' | 'en'>(i18n.language as 'he' | 'en');

  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsSubmenu, setShowSettingsSubmenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const langRef = useRef<HTMLDivElement>(null);
  const toggleLang = () => setLangOpen(!isLangOpen);

  const menuItems: MenuItem[] = [
    { icon: Home, label: t('header.home'), path: '/' },
    { icon: ScrollText, label: t('header.log'), path: '/log' },
    { icon: CalendarCheck2, label: t('header.scheduled'), path: '/scheduled' },
    { icon: Pill, label: t('header.medicines'), path: '/medicines' },
    { icon: Users, label: t('header.kids'), path: '/kids' },
    {
      icon: Settings, label: t('header.settings'),
      submenu: [
        { icon: PillBottle, label: t('header.manageMedicines'), path: '/settings/medicines' },
        { icon: UserCog, label: t('header.manageUsers'), path: '/settings/users' }
      ]
    },
    { icon: Info, label: t('header.about') },

  ];

  const handleLogout = () => {
    // logout();
    console.log ('*** handle logout', {user})
    setShowLoginModal(true);
  };

  const handleLoginDialogClose = () => {
    setShowLoginModal(false);
    setIsOpen(false); // Close the menu when login dialog closes
    setShowSettingsSubmenu(false); // Also close the submenu
  };

  const handleAboutDialogClose = () => {
    setShowAbout(false);
    setIsOpen(false); // Close the menu when about dialog closes
  };

  const handleMenuItemClick = (label: string, path: string|undefined, hasSubmenu: boolean) => {
    if (label === t('header.about')) {
      setShowAbout(true);
      setIsOpen(false); // Close the menu when about is clicked
    } else if (hasSubmenu) {
      setShowSettingsSubmenu(!showSettingsSubmenu);
    } else if (path) {
      navigate(path);
      setIsOpen(false);
      setShowSettingsSubmenu(false);
    }
  };

  const handleLanguageSelect = (lang: 'he' | 'en') => {
    setLanguage(lang);
    setLangOpen(false);
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
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
          <div className="flex items-center justify-center flex-grow">
            <span className="text-xl font-bold text-emerald-600">{t('appTitle')}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={langRef}>
              <button
                className="bg-transparent border-none text-gray-600 p-1 rounded cursor-pointer flex items-center transition-colors duration-200"
                onClick={toggleLang}
              >
                <span>{i18n.language.toUpperCase()}</span>
                <img src={i18n.language === 'he' ? ilFlag : ukFlag} alt="flag" className="w-5 h-5 mr-1" />
              </button>

              {isLangOpen && (
                <div className="absolute top-10 right-0 bg-white text-black border border-gray-300 rounded-md shadow-md w-max z-50 py-1">
                  <div
                    onClick={() => handleLanguageSelect('he')}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <span>HE</span>
                    <img src={ilFlag} alt="IL" className="w-5 h-5 mr-2" />

                  </div>
                  <div
                    onClick={() => handleLanguageSelect('en')}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <span>EN</span>
                    <img src={ukFlag} alt="EN" className="w-5 h-5 mr-2" />
                  </div>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">{user?.username || ''}</span>
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
                        onClick={() => handleMenuItemClick(label, path, !!submenu)}
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
                              onClick={() => handleMenuItemClick(subItem.label, subItem.path, false)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50"
                            >
                              {subItem.icon && <subItem.icon className="h-5 w-5" />}
                              <span>{subItem.label}</span>
                            </button>
                          ))}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50"
                          >
                            <LogOut className="h-5 w-5" />
                            <span>{t('header.switchUser')}</span>
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

      {showLoginModal && <LoginDialog onClose={(handleLoginDialogClose)} />}
      {showAbout && <AboutDialog onClose={handleAboutDialogClose} />}
    </div>
  );
};

export default Header;
