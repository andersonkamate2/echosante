'use client';

import { useThemeLanguage } from './ThemeLanguageProvider';

export default function ThemeLanguageControls() {
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        className="theme-control-button"
        aria-label={t('theme')}
      >
        {theme === 'light' ? t('light') : t('dark')}
      </button>
      <div className="flex items-center gap-1 rounded-full border border-current bg-theme-surface px-1 py-1">
        <button
          type="button"
          onClick={() => setLanguage('fr')}
          className={`theme-language-button ${language === 'fr' ? 'theme-language-active' : ''}`}
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`theme-language-button ${language === 'en' ? 'theme-language-active' : ''}`}
        >
          EN
        </button>
      </div>
    </div>
  );
}
