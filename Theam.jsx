import { useEffect } from 'react';

/**
 * Reads the OS-level color scheme preference and applies the
 * matching Tailwind `.dark` class to <html>. Also listens for
 * real-time changes (e.g. user flips dark-mode in Android settings).
 *
 * This runs BEFORE the Profile page's manual toggle, so the manual
 * toggle still works — it just overrides the OS default.
 */
export default function ThemeProvider({ children }) {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = (dark) => {
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply immediately on mount (only if user hasn't manually set a preference)
    const stored = localStorage.getItem('easy-stay-theme');
    if (!stored) {
      apply(mq.matches);
    } else {
      apply(stored === 'dark');
    }

    // Listen for OS-level changes
    const handler = (e) => {
      const stored = localStorage.getItem('easy-stay-theme');
      if (!stored) apply(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return children;
}
