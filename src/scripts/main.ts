/**
 * Client entry point, loaded once by BaseLayout. Astro bundles and defers it.
 */
import Lenis from 'lenis';
import { initNavs } from './nav';
import { initSliders } from './slider';
import { initForms } from './forms';
import { initAnimations } from './animations';

// Smooth scrolling: same settings as the original template.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, infinite: false });
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

initNavs();
initSliders();
initForms();
initAnimations();
