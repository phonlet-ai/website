'use client';
import { useEffect } from 'react';

/**
 * Page-wide motion: elements with data-reveal fade and rise into view (once), and elements with
 * the class "spot" get a light that follows the pointer (--mx, --my). Without JavaScript, or
 * with reduced motion, everything is simply visible.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('motion-ready');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    const watch = () =>
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => observer.observe(el));
    watch();
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });
    const move = (event: PointerEvent) => {
      const spot = (event.target as Element | null)?.closest?.('.spot') as HTMLElement | null;
      if (!spot) return;
      const box = spot.getBoundingClientRect();
      spot.style.setProperty('--mx', `${event.clientX - box.left}px`);
      spot.style.setProperty('--my', `${event.clientY - box.top}px`);
    };
    document.addEventListener('pointermove', move, { passive: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      document.removeEventListener('pointermove', move);
      root.classList.remove('motion-ready');
    };
  }, []);
  return null;
}
