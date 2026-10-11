/**
 * Reset window scroll to top on every client-side route change.
 * Fixes pages opening mid/bottom when navigating from a scrolled homepage.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTopOnNavigate = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Keep in-page anchors (e.g. #search-form) working
    if (hash) return;

    const reset = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    reset();
    // Lazy pages mount a moment later; ensure we stay at top after paint
    const raf = window.requestAnimationFrame(reset);
    const t = window.setTimeout(reset, 0);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTopOnNavigate;
