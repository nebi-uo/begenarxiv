import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures the browser smoothly scrolls to the very top (0, 0)
 * on every page navigation / route transition.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window and document elements to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

