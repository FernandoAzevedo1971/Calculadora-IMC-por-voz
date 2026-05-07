import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function useApplyTheme() {
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      let resolved: 'light' | 'dark' | 'hc' = 'light';
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      if (resolved === 'light') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', resolved);
    };
    apply();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);
}
