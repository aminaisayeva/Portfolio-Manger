import { useEffect } from 'react';
import { useTheme } from '@/contexts/theme-context';

export function useSystemTheme() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  return theme;
}
