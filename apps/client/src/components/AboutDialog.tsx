import React from 'react';
import packageJson from '../../package.json';
import { useTranslation } from 'react-i18next';

// i18n.changeLanguage('he');
// import i18n from 'i18next';


interface AboutDialogProps {
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const textDirection = currentLanguage === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 z-50 shadow-xl text-center" dir={textDirection}>
        <h2 className="text-xl font-bold mb-2">{t('appTitle')}</h2>
        <h3 className="mb-4">{t('about.description')}</h3>
        <div className="text-start" dir={textDirection}>
        <p><strong>{t(`about.version`)}:</strong> {packageJson.version}</p>
        <p><strong>{t(`about.developer`)}</strong> {t(`about.developerName`)}</p>
        <p>
          <strong>{t(`about.emailLabel`)}:</strong> <a href="mailto:yshauser@gmail.com" className="text-blue-600 hover:underline">yshauser@gmail.com</a>
        </p>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            {t(`header.close`)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;
