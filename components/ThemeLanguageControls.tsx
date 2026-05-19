'use client';

import { useThemeLanguage } from './ThemeLanguageProvider';

export default function ThemeLanguageControls() {
  const { theme, toggleTheme, t } = useThemeLanguage();

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
    </div>
  );
}
