import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/shared/components/ui/switch';

const THEME_STORAGE_KEY = 'library-theme';
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

type Theme = 'light' | 'dark';

const getStoredTheme = (): Theme | null => {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  } catch {
    return null;
  }
};

const prefersDarkMode = () => window.matchMedia?.(DARK_MODE_QUERY).matches ?? false;

const applyTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
};

const ThemeSwitch = () => {
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = getStoredTheme();
    return storedTheme ? storedTheme === 'dark' : prefersDarkMode();
  });

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    if (getStoredTheme()) return;

    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setIsDark(event.matches);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const handleThemeChange = (checked: boolean) => {
    const theme: Theme = checked ? 'dark' : 'light';

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The theme still works for the current session when storage is unavailable.
    }

    setIsDark(checked);
  };

  return (
    <div
      className="flex items-center gap-1.5"
      title={isDark ? 'Dark mode' : 'Light mode'}
    >
      <Sun
        className={`size-4 transition-colors ${isDark ? 'text-muted-foreground' : 'text-primary'}`}
        aria-hidden="true"
      />
      <Switch
        checked={isDark}
        onCheckedChange={handleThemeChange}
        aria-label="Dark mode"
      />
      <Moon
        className={`size-4 transition-colors ${isDark ? 'text-primary' : 'text-muted-foreground'}`}
        aria-hidden="true"
      />
    </div>
  );
};

export default ThemeSwitch;
