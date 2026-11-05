import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures the browser smoothly scrolls to the very top (0, 0)
 * on every page navigation / route transition.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // Fallback for older environments
    }
  }, [pathname]);

  return null;
}

