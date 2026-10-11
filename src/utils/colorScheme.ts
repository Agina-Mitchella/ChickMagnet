import { useLayoutEffect, useState } from 'react';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'chickmagnet_color_scheme';

function getInitialPreference(): ColorSchemePreference {
  try {
    const savedPreference = window.localStorage.getItem(STORAGE_KEY);
    if (savedPreference === 'light' || savedPreference === 'dark' || savedPreference === 'system') {
      return savedPreference;
    }
  } catch {
    // The system preference remains available when browser storage is disabled.
  }

  return 'system';
}

export function useColorScheme() {
  const [preference, setPreference] = useState<ColorSchemePreference>(getInitialPreference);

  useLayoutEffect(() => {
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');

    const applyPreference = () => {
      const resolvedPreference = preference === 'system'
        ? (systemPreference.matches ? 'dark' : 'light')
        : preference;
      const root = document.documentElement;

      root.classList.toggle('dark', resolvedPreference === 'dark');
      root.dataset.colorScheme = resolvedPreference;
      root.dataset.colorSchemePreference = preference;
      root.style.colorScheme = resolvedPreference;

      document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
        ?.setAttribute('content', resolvedPreference === 'dark' ? '#07130e' : '#fffdf9');
    };

    applyPreference();
    systemPreference.addEventListener('change', applyPreference);

    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Theme selection still applies for the current page when storage is unavailable.
    }

    return () => systemPreference.removeEventListener('change', applyPreference);
  }, [preference]);

  return { preference, setPreference };
}
