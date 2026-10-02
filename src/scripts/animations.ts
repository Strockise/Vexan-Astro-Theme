/**
 * Animations: a 1:1 GSAP rebuild of the Webflow IX3 interactions of the original template.
 * Triggers, durations, delays (positions), staggers and eases are copied from the Webflow
 * interaction data. Elements opt in through the same attributes/classes Webflow used:
 *
 *   page-load-1/3/4/5     fade-up on page load (0 / .4 / .6 / .8 s)
 *   page-scroll-1/2/3     fade-up when scrolled into view (0 / .4 / .6 s)
 *   top-delay-0/2/3       fade-up when scrolled into view (0 / .2 / .4 s)
 *   heading-style-1       line-by-line reveal on load (use on the page <h1>)
 *   heading-style-2       line-by-line reveal on scroll
 *   scroll-list / delay-02  staggered reveal of the element's direct children
 *
 * Initial states are applied before `w-mod-ix3` is added to <html>, which lifts the
 * visibility guard in custom.css (no flash of un-animated content).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Webflow IX3 ease table entries used by this template */
const EASE = { none: 'none', in: 'power1.in', inOut: 'power1.inOut', sine: 'sine.out', default: 'power1.out' } as const;
/* IX3 default duration */
const D = 0.5;
const FADE_FROM = { opacity: 0, y: 80 };
const FADE_TO = { opacity: 1, y: 0 };

type Target = gsap.TweenTarget;
type Build = (tl: gsap.core.Timeline) => void;

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const within = (root: Element, sel: string) => $$(sel, root);
const has = (t: Target) => (Array.isArray(t) ? t.length > 0 : !!t);
const clamp = (v: string) => `clamp(${v})`;

/* ---------- SplitText helpers (one split per element and type) ---------- */
const splits = new WeakMap<Element, Map<string, SplitText>>();
function split(targets: Element[], type: 'lines' | 'words' | 'chars', mask = false): Element[] {
  const out: Element[] = [];
  for (const el of targets) {
    let byType = splits.get(el);
    if (!byType) splits.set(el, (byType = new Map()));
    const key = type + (mask ? ':mask' : '');
    let s = byType.get(key);
    if (!s) {
      // Chars are always nested in word wrappers (as Webflow does) so lines never break mid-word.
      const splitType = type === 'chars' ? 'words,chars' : type;
      s = SplitText.create(el, { type: splitType, ...(mask ? { mask: type } : {}) });
      byType.set(key, s);
    }
    out.push(...(s[type] as Element[]));
  }
  return out;
}

/* ---------- Trigger helpers (mirror IX3 trigger types) ---------- */

/** Scroll "enter → play" (IX3 scroll trigger with scrub: null). */
function onScrollEnter(trigger: Element, start: string, build: Build, end = 'bottom top') {
  const tl = gsap.timeline({ paused: true });
  build(tl);
  ScrollTrigger.create({ trigger, start: clamp(start), end: clamp(end), animation: tl, toggleActions: 'play none none none' });
}

/** Scroll scrubbed timeline (IX3 scroll trigger with scrub). */
function onScrollScrub(trigger: Element, start: string, end: string, scrub: number, build: Build, canvasDuration = 0) {
  const tl = gsap.timeline({ scrollTrigger: { trigger, start: clamp(start), end: clamp(end), scrub } });
  build(tl);
  // IX3 "canvas" timelines have a fixed length: shorter actions finish before the end of the scroll range.
  if (canvasDuration && tl.duration() < canvasDuration) tl.set({}, {}, canvasDuration);
}

/** Hover: play on mouseenter, reverse on mouseleave (per element). */
function onHover(selector: string, build: (tl: gsap.core.Timeline, el: HTMLElement) => void) {
  for (const el of $$(selector)) {
    const tl = gsap.timeline({ paused: true });
    build(tl, el);
    if (!tl.getChildren().length) continue;
    el.addEventListener('mouseenter', () => tl.play());
    el.addEventListener('mouseleave', () => tl.reverse());
  }
}

/** Page load timeline. */
function onLoad(build: Build) {
  const tl = gsap.timeline();
  build(tl);
  return tl;
}

function fromTo(tl: gsap.core.Timeline, t: Target, from: gsap.TweenVars, to: gsap.TweenVars, pos = 0) {
  if (has(t)) tl.fromTo(t, from, { duration: D, ease: EASE.default, ...to }, pos);
}
function to(tl: gsap.core.Timeline, t: Target, vars: gsap.TweenVars, pos = 0) {
  if (has(t)) tl.to(t, { duration: D, ease: EASE.default, ...vars }, pos);
}

/* =====================================================================
 * 1. Page-load reveals
 * ===================================================================== */
function pageLoad() {
  onLoad((tl) => {
    fromTo(tl, $$('[page-load-1]'), FADE_FROM, { ...FADE_TO, ease: EASE.sine }, 0);
    fromTo(tl, $$('[page-load-3]'), FADE_FROM, { ...FADE_TO, ease: EASE.sine }, 0.4);
    fromTo(tl, $$('[page-load-4]'), FADE_FROM, { ...FADE_TO, ease: EASE.sine }, 0.6);
    fromTo(tl, $$('[page-load-5]'), FADE_FROM, { ...FADE_TO, ease: EASE.sine }, 0.8);
  });

  // heading-style-1: masked line reveal
  const h1 = $$('[heading-style-1]');
  if (h1.length) {
    onLoad((tl) => fromTo(tl, split(h1, 'lines', true), FADE_FROM, { ...FADE_TO, duration: 0.6, stagger: { each: 0.01 }, ease: EASE.sine }, 0.2));
  }

  // About hero bottom block and contact form (class-targeted load actions)
  onLoad((tl) => {
    fromTo(tl, $$('.about-hero-bottom-wrapper'), { y: 80, opacity: 0 }, { y: 0, opacity: 1 }, 0.1);
    fromTo(tl, $$('.contact-form-wrapper'), FADE_FROM, FADE_TO, 0.5);
  });

  // load-stagger: children fade up one after another on load
  //   ""      → 80px, starts at 0 s (changelog)
  //   "delay" → 80px, starts at .4 s (licenses)
  //   "rem"   → 5rem, starts at 0 s (404)
  for (const el of $$('[load-stagger]')) {
    const mode = el.getAttribute('load-stagger');
    onLoad((tl) =>
      fromTo(tl, Array.from(el.children), { opacity: 0, y: mode === 'rem' ? '5rem' : 80 }, { opacity: 1, y: mode === 'rem' ? '0rem' : 0, stagger: { each: 0.2 } }, mode === 'delay' ? 0.4 : 0));
  }
}

/* =====================================================================
 * 2. Scroll-into-view reveals
 * ===================================================================== */
function scrollReveals() {
  const simple: [string, string, gsap.TweenVars, number][] = [
    ['[page-scroll-1]', 'top 95%', { duration: 0.6, ease: EASE.sine }, 0],
    ['[page-scroll-2]', 'top 95%', { duration: 0.6, ease: EASE.sine }, 0.4],
    ['[page-scroll-3]', 'top 95%', { ease: EASE.sine }, 0.6],
    ['[top-delay-0]', 'top 90%', { ease: EASE.sine }, 0],
    ['[top-delay-2]', 'top 90%', { ease: EASE.sine }, 0.2],
    ['[top-delay-3]', 'top 90%', {}, 0.4],
    ['.process-trust-wrapper', 'top 95%', { ease: EASE.sine }, 0.8],
  ];
  for (const [sel, start, vars, pos] of simple) {
    for (const el of $$(sel)) onScrollEnter(el, start, (tl) => fromTo(tl, el, FADE_FROM, { ...FADE_TO, ...vars }, pos));
  }

  for (const el of $$('[scroll-list]')) {
    onScrollEnter(el, 'top 90%', (tl) =>
      fromTo(tl, Array.from(el.children), FADE_FROM, { ...FADE_TO, duration: 0.6, stagger: { each: 0.2 }, ease: EASE.sine }, 0.2));
  }
  for (const el of $$('[delay-02]')) {
    onScrollEnter(el, 'top bottom', (tl) =>
      fromTo(tl, Array.from(el.children), FADE_FROM, { ...FADE_TO, stagger: { each: 0.2 }, ease: EASE.none }, 0.2));
  }
  for (const el of $$('[heading-style-2]')) {
    onScrollEnter(el, 'top 95%', (tl) =>
      fromTo(tl, split([el], 'lines', true), FADE_FROM, { ...FADE_TO, duration: 0.6, stagger: { each: 0.2 }, ease: EASE.sine }), 'bottom bottom');
  }
  for (const el of $$('.approach-line')) {
    onScrollEnter(el, 'top 60%', (tl) => fromTo(tl, el, { scale: 0 }, { scale: 1 }, 0.5));
  }
}

/* =====================================================================
 * 3. Scrubbed text highlights
 * ===================================================================== */
function textScrub() {
  const items: [string, string, string, 'words' | 'chars', boolean, number, number][] = [
    // selector, start, end, split type, mask, stagger, from opacity
    ['.service-details-text', 'top 80%', 'bottom 30%', 'words', true, 0.3, 0.2],
    ['.philosophy-details-text', 'top 80%', 'bottom 30%', 'words', true, 0.2, 0.2],
    ['.story-details-text', 'top 80%', 'bottom 20%', 'chars', true, 0.1, 0.2],
  ];
  for (const [sel, start, end, type, mask, each, from] of items) {
    for (const el of $$(sel)) {
      onScrollScrub(el, start, end, 0.8, (tl) =>
        fromTo(tl, split([el], type, mask), { opacity: from }, { opacity: 1, stagger: { each }, ease: EASE.none }));
    }
  }
  for (const el of $$('.story-summary')) {
    onScrollScrub(el, 'top 80%', 'bottom 50%', 0.8, (tl) =>
      fromTo(tl, split([el], 'chars'), { opacity: 0.2 }, { opacity: 1, duration: 1, stagger: { each: 0.1 }, ease: EASE.none }));
  }
  // .about-title: the timeline targets every .about-title on the page (as in Webflow)
  const aboutTitles = $$('.about-title');
  for (const el of aboutTitles) {
    onScrollScrub(el, 'top bottom', 'bottom 20%', 0.8, (tl) =>
      fromTo(tl, split(aboutTitles, 'chars', true), { opacity: 0.3 }, { opacity: 1, stagger: { each: 0.2 }, ease: EASE.none }));
  }
}

/* =====================================================================
 * 4. Sticky / horizontal scroll sections
 * ===================================================================== */
function stickySections() {
  // Home service section: header lines + cards fly in, then scroll horizontally
  for (const trigger of $$('.section_service')) {
    onScrollScrub(trigger, 'top center', 'bottom bottom', 0.8, (tl) => {
      const subtitle = split($$('.section-subtitle-block'), 'lines', true);
      const heading = split($$('.heading-style-2.text-color-white'), 'lines', true);
      fromTo(tl, subtitle, { y: 80 }, { y: 0, duration: 1, ease: EASE.sine }, 0);
      fromTo(tl, heading, { y: 80 }, { y: 0, duration: 1, ease: EASE.sine }, 0);
      const cards = $$('.service-cms-wrapper-v1');
      fromTo(tl, cards, { y: '100vh', x: '100vw' }, { y: '0vh', x: '50vw', duration: 1, ease: EASE.none }, 0.71);
      to(tl, cards, { x: '-100%', duration: 1.25, ease: EASE.none }, 1.71);
      // trailing hold (opacity 100% → 100%) so the end of the scroll range stays still
      if (cards.length) tl.to({}, { duration: 0.68616 }, 2.96);
    });
  }

  // About values + home blog: horizontal track driven by a tall sticky container
  const horizontal: [string, string][] = [
    ['.values-sticky-container', '.values-content-wrapper'],
    ['.blog-sticky-container', '.blog-content-wrapper'],
  ];
  for (const [trigger, track] of horizontal) {
    for (const el of $$(trigger)) {
      onScrollScrub(el, 'top top', 'bottom bottom', 0.8, (tl) => to(tl, $$(track), { x: '-100%', duration: 1, ease: EASE.none }));
    }
  }

  // Desktop only (Webflow: "don't animate" on medium / small / tiny)
  gsap.matchMedia().add('(min-width: 992px)', () => {
    for (const el of $$('.approach-sticky-container')) {
      onScrollScrub(el, 'top bottom', '70% 70%', 0.8, (tl) => {
        fromTo(tl, within(el, '.approach-single-card.is-01'), { y: '0%', x: '100%' }, { y: '0%', x: '0%', duration: 0.3, ease: EASE.none }, 0);
        fromTo(tl, within(el, '.approach-single-card.is-02'), { y: '15%', x: '0%' }, { y: '0%', x: '0%', duration: 0.3, ease: EASE.none }, 0);
        fromTo(tl, within(el, '.approach-single-card.is-03'), { y: '30%', x: '-100%' }, { y: '0%', x: '0%', duration: 0.3, ease: EASE.none }, 0);
      });
    }
    for (const el of $$('.hero-sticky-container')) {
      onScrollScrub(el, 'top center', 'bottom bottom', 0.8, (tl) => {
        to(tl, $$('.hero-brand-logo'), { height: '64px', width: '173.33px', duration: 0.55, ease: EASE.none }, 0);
        to(tl, within(el, '.nav-menu-content'), { y: '-140px', duration: 0.55, ease: EASE.none }, 0);
        fromTo(tl, within(el, '.hero-container'), { y: '50vh' }, { y: '0vh', duration: 0.55, ease: EASE.none }, 0);
      }, 1);
    }
  });
}

/* =====================================================================
 * 5. Infinite loops (marquees, hero gallery, trusted slider)
 * ===================================================================== */
function loops() {
  // On load
  if ($$('.logo-row-block').length) gsap.to('.logo-row-block', { x: '-60%', duration: 50, repeat: -1, ease: EASE.none });
  if ($$('.about-image-wrap').length) gsap.to('.about-image-wrap', { x: '-100%', duration: 40, repeat: -1, ease: EASE.none });

  // Start when the trigger first enters the viewport
  const onEnterLoops: [string, (tl: gsap.core.Timeline) => void][] = [
    ['.marque-content-wrapper', (tl) => fromTo(tl, $$('.marque-content-wrap'), { x: '-100%' }, { x: '0%', duration: 40, repeat: -1, ease: EASE.none })],
    ['.recognition-name-block', (tl) => { tl.repeat(-1); to(tl, $$('.recognition-image'), { x: '-100%', duration: 25, ease: EASE.none }); }],
    ['.story-bottom-wrapper', (tl) => { tl.repeat(-1); to(tl, $$('.story-marque-text-block'), { x: '-100%', duration: 80, ease: EASE.none }); }],
    ['.testimonial-wrapper', (tl) => { tl.repeat(-1); to(tl, $$('.testimonial-card-wrap'), { x: '-100%', duration: 40, ease: EASE.none }); }],
  ];
  for (const [sel, build] of onEnterLoops) for (const el of $$(sel)) onScrollEnter(el, 'top bottom', build);

  // Stats counters roll
  for (const el of $$('.stats-number-block')) {
    onScrollEnter(el, 'top bottom', (tl) => {
      to(tl, within(el, '.counter-text-block.down'), { y: '80%', duration: 1, ease: EASE.none }, 0);
      to(tl, within(el, '.counter-text-block.up'), { y: '-80%', duration: 1, ease: EASE.none }, 0);
      to(tl, within(el, '.counter-text-block.up-copy'), { y: '86%', duration: 1, ease: EASE.none }, 0);
    });
  }

  // Hero gallery crossfade (home)
  if ($$('.hero-image').length) {
    const tl = gsap.timeline({ repeat: -1 });
    const op = (sel: string, a: number, b: number, pos: number) => fromTo(tl, $$(sel), { opacity: a }, { opacity: b, duration: 2 }, pos);
    const w = (sel: string, a: string, b: string, pos: number) => fromTo(tl, $$(sel), { width: a }, { width: b, duration: 2 }, pos);
    const T = 'var(--_colors---main-color--transparent)';
    const B = 'var(--_colors---main-color--black-400)';
    const bc = (sel: string, a: string, b: string, pos: number) => fromTo(tl, $$(sel), { borderColor: a }, { borderColor: b, duration: 2 }, pos);
    // 0s
    op('.hero-image.is-01', 1, 0, 0); op('.hero-image.is-02', 0, 1, 0); op('.hero-image.is-03', 0, 0, 0);
    op('.hero-summary-block.is-01', 1, 0, 0); w('.hero-gallery-line.is-01', '0px', 'auto', 0); bc('.hero-gallery-image.is-01', T, B, 0);
    // 2s
    op('.hero-image.is-01', 0, 0, 2); op('.hero-image.is-02', 1, 0, 2); op('.hero-image.is-03', 0, 1, 2);
    op('.hero-summary-block.is-02', 1, 0, 2); op('.hero-summary-block.is-01', 1, 0, 2);
    w('.hero-gallery-line.is-02', '0px', 'auto', 2); w('.hero-gallery-line.is-01', '0px', '0px', 2);
    bc('.hero-gallery-image.is-02', T, B, 2); bc('.hero-gallery-image.is-01', T, T, 2);
    // 3.99s
    op('.hero-image.is-03', 1, 0, 3.99); op('.hero-image.is-01', 0, 1, 3.99); op('.hero-image.is-02', 0, 0, 3.99);
    op('.hero-summary-block.is-03', 1, 1, 3.99); op('.hero-summary-block.is-02', 1, 0, 3.99);
    w('.hero-gallery-line.is-03', '0px', 'auto', 3.99); w('.hero-gallery-line.is-02', '0px', '0px', 3.99);
    bc('.hero-gallery-image.is-03', T, B, 3.99); bc('.hero-gallery-image.is-02', T, T, 3.99);
  }

  // Trusted-by slider (about page)
  if ($$('[trusted-slider-01]').length) {
    const tl = gsap.timeline({ repeat: -1 });
    const s = '[trusted-slider-01]';
    const c = (n: number) => `[trusted-card-01="${n}"]`;
    to(tl, s, { x: '-72%', duration: 1 }, 1);
    fromTo(tl, c(1), { scale: 0.8 }, { scale: 0.8, duration: 1, ease: EASE.none }, 1);
    fromTo(tl, c(2), { scale: 1 }, { scale: 0.8, duration: 1 }, 1);
    fromTo(tl, c(3), { scale: 0.8 }, { scale: 1, duration: 1 }, 1);
    fromTo(tl, s, { x: '-72%' }, { x: '-150%', duration: 1, ease: EASE.none }, 3);
    fromTo(tl, c(1), { scale: 0.8 }, { scale: 1, duration: 1 }, 3);
    fromTo(tl, c(2), { scale: 0.8 }, { scale: 0.8, duration: 1, ease: EASE.none }, 3);
    fromTo(tl, c(3), { scale: 1 }, { scale: 0.8, duration: 1 }, 3);
    fromTo(tl, s, { x: '-150%' }, { x: '-250%', duration: 1, ease: EASE.none }, 5);
    fromTo(tl, c(1), { scale: 1 }, { scale: 0.8, duration: 1, ease: EASE.none }, 5);
    fromTo(tl, c(2), { scale: 1 }, { scale: 1, duration: 1 }, 5);
    fromTo(tl, c(3), { scale: 1 }, { scale: 0.8, duration: 1, ease: EASE.none }, 5);
  }
}

/* =====================================================================
 * 6. Hover interactions
 * ===================================================================== */
function hovers() {
  onHover('.primary-button', (tl, el) => {
    const block = within(el, '.primary-button-text-block');
    to(tl, split(block, 'words'), { y: '-101%', duration: 0.4, ease: EASE.sine }, 0);
    fromTo(tl, within(el, '.primary-button-overlay'), { width: '0px' }, { width: 'auto', duration: 0.4, ease: EASE.sine }, 0);
    fromTo(tl, within(el, '.primary-button-icon.is-01'), { scale: 0 }, { scale: 1, duration: 0.4, ease: EASE.sine }, 0);
    fromTo(tl, within(el, '.primary-button-icon.is-02'), { scale: 1 }, { scale: 0, duration: 0.4, ease: EASE.sine }, 0);
    to(tl, block, { x: '16%', duration: 0.4, ease: EASE.sine }, 0);
  });

  onHover('.secondary-button', (tl, el) => {
    // legacy markup variant
    const W = 'var(--_colors---main-color--white-color)';
    const P = 'var(--_colors---main-color--primary-color)';
    fromTo(tl, within(el, '.button-text-block'), { x: '0px', backgroundColor: W }, { x: '43px', backgroundColor: P, duration: 0.2, ease: EASE.in }, 0);
    fromTo(tl, within(el, '.button-arrow.is-left'), { scale: 0, backgroundColor: P }, { scale: 1, backgroundColor: P, duration: 0.2, ease: EASE.in }, 0);
    fromTo(tl, within(el, '.button-arrow.is-right'), { scale: 1, backgroundColor: P }, { scale: 0, backgroundColor: P, duration: 0.2, ease: EASE.in }, 0);
    fromTo(tl, within(el, '.button-text.text-color-black'), { color: 'var(--_colors---main-color--black-color)' }, { color: W, duration: 0.2, ease: EASE.in }, 0);
    // current markup
    fromTo(tl, within(el, '.secondary-button-arrow.is-left'), { scale: 0 }, { scale: 1, duration: 0.2 }, 0);
    fromTo(tl, within(el, '.secondary-button-text'), { x: '0%' }, { x: '30%', duration: 0.1 }, 0);
    fromTo(tl, within(el, '.secondary-button-arrow.is-right'), { scale: 1 }, { scale: 0, duration: 0.2 }, 0);
  });

  onHover('.project-button', (tl, el) => {
    fromTo(tl, within(el, '.button-overlay'), { width: '0px' }, { width: 'auto', duration: 0.3, ease: EASE.sine }, 0);
    to(tl, split(within(el, '.button-text-block'), 'words'), { y: '-101%', duration: 0.3, ease: EASE.sine }, 0);
  });

  onHover('.blog-button', (tl, el) => {
    const block = within(el, '.blog-button-text-block');
    fromTo(tl, within(el, '.blog-button-iocn.is-01'), { scale: 0 }, { scale: 1, duration: 0.4, ease: EASE.sine }, 0);
    fromTo(tl, within(el, '.blog-button-iocn.is-02'), { scale: 1 }, { scale: 0, duration: 0.4, ease: EASE.sine }, 0);
    to(tl, split(block, 'words'), { y: '-101%', duration: 0.4, ease: EASE.sine }, 0);
    to(tl, block, { x: '18%', duration: 0.4, ease: EASE.sine }, 0);
    fromTo(tl, within(el, '.blog-button-overlay'), { width: '0px' }, { width: 'auto', duration: 0.4, ease: EASE.sine }, 0);
  });

  onHover('.blog-button-v1', (tl, el) => to(tl, split(within(el, '.blog-button-text'), 'words'), { y: '-101%', duration: 0.4, ease: EASE.sine }));

  onHover('.nav-link', (tl, el) => {
    fromTo(tl, split(within(el, '.nav-link-text.is-01'), 'chars'), { y: '0%' }, { y: '-101%', duration: 0.4, stagger: { each: 0.02 }, ease: EASE.inOut }, 0);
    fromTo(tl, split(within(el, '.nav-link-text.is-02'), 'chars'), { y: '101%' }, { y: '0%', duration: 0.4, stagger: { each: 0.02 } }, 0);
  });

  onHover('.project-image-block.text-align-center', (tl, el) => {
    to(tl, within(el, '.project-image'), { scale: 1.1, duration: 0.4, ease: EASE.sine }, 0);
    fromTo(tl, within(el, '.view-more-button'), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: EASE.sine }, 0);
  });

  onHover('.blog-image-link', (tl, el) => to(tl, within(el, '.blog-image'), { scale: 1.1 }));
  onHover('.blog-card-image-link', (tl, el) => to(tl, within(el, '.blog-card-image'), { scale: 1.1 }));
  onHover('.service-image-block', (tl, el) => to(tl, within(el, '.service-image'), { scale: 1.1, ease: EASE.sine }));

  onHover('.recognition-single-card', (tl, el) => {
    fromTo(tl, within(el, '.recognition-icon-block'), { scale: 0 }, { scale: 1, ease: EASE.sine }, 0);
    fromTo(tl, within(el, '.recognition-title-block.is-01'), { x: '-2.75rem' }, { x: '0px', ease: EASE.sine }, 0);
  });
}

/* =====================================================================
 * 7. Mouse follow: "View more" button on home project cards
 * ===================================================================== */
/** Follow smoothness: higher duration = softer, more delayed glide behind the cursor. */
const FOLLOW_DURATION = 0.6;
const FOLLOW_EASE = 'power3.out';

function mouseFollow() {
  for (const block of $$('.project-image-block.text-align-center')) {
    const btn = within(block, '.view-more-button');
    if (!btn.length) continue;
    const tlX = gsap.timeline({ paused: true }).fromTo(btn, { x: '-150%' }, { x: '150%', duration: 1, ease: EASE.none });
    const tlY = gsap.timeline({ paused: true }).fromTo(btn, { y: '-150%' }, { y: '150%', duration: 1, ease: EASE.none });
    const px = { p: 0 };
    const py = { p: 0 };
    const qx = gsap.quickTo(px, 'p', { duration: FOLLOW_DURATION, ease: FOLLOW_EASE, onUpdate: () => { tlX.progress(px.p); } });
    const qy = gsap.quickTo(py, 'p', { duration: FOLLOW_DURATION, ease: FOLLOW_EASE, onUpdate: () => { tlY.progress(py.p); } });
    tlX.progress(0);
    tlY.progress(0);
    block.addEventListener('mousemove', (e) => {
      const r = block.getBoundingClientRect();
      qx(gsap.utils.clamp(0, 1, (e.clientX - r.left) / r.width));
      qy(gsap.utils.clamp(0, 1, (e.clientY - r.top) / r.height));
    });
    block.addEventListener('mouseleave', () => { qx(0); qy(0); });
  }
}

/* =====================================================================
 * 8. Click interactions (FAQ accordion, principles, real-life results)
 * ===================================================================== */
function clicks() {
  // FAQ accordion: toggle play / reverse
  for (const item of $$('.faq-tab-link')) {
    const tl = gsap.timeline({ paused: true, reversed: true });
    fromTo(tl, within(item, '.faq-content-wrap'), { height: '0px' }, { height: 'auto' }, 0);
    fromTo(tl, within(item, '.faq-icon.is-01'), { rotation: 90 }, { rotation: 0 }, 0);
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-expanded', 'false');
    const toggle = () => {
      const opening = tl.reversed() || tl.progress() === 0;
      opening ? tl.play() : tl.reverse();
      item.setAttribute('aria-expanded', String(opening));
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  // Generic "open one, close the others" tab group
  const tabGroup = (count: number, trigger: (n: number) => string, panel: (n: number) => string, extra?: (tl: gsap.core.Timeline, n: number) => void) => {
    for (let n = 1; n <= count; n++) {
      for (const el of $$(trigger(n))) {
        el.addEventListener('click', () => {
          const tl = gsap.timeline();
          for (let k = 1; k <= count; k++) to(tl, $$(panel(k)), { height: k === n ? 'auto' : '0px' }, 0);
          extra?.(tl, n);
        });
      }
    }
  };

  tabGroup(4, (n) => `.principle-content-wrap.is-0${n}`, (n) => `.principle-details-block-two.is-0${n}`, (tl, n) => {
    for (let k = 1; k <= 4; k++) to(tl, $$(`.principle-icon-block.is-0${k}`), { opacity: k === n ? 0 : 1 }, 0);
  });

  tabGroup(3, (n) => `.real-life-tab-link.is-0${n}`, (n) => `.real-result-detailst-block.is-0${n}`, (tl, n) => {
    for (let k = 1; k <= 3; k++) to(tl, $$(`.faq-icon.is-01.is-rotate-0${k}`), { rotation: k === n ? 0 : 90 }, 0);
  });
}

/* =====================================================================
 * 9. Number counters ([data-counter]) from the template's custom code
 * ===================================================================== */
function counters() {
  for (const counter of $$('[data-counter]')) {
    const textEl = (counter.firstElementChild as HTMLElement) || counter;
    const original = (textEl.textContent || '').trim();
    const match = original.match(/^([^0-9.-]*)([0-9.,-]+)(.*)$/);
    if (!match) continue;
    const [, prefix, raw, suffix] = match;
    const number = raw.replace(/,/g, '');
    const target = parseFloat(number);
    if (isNaN(target)) continue;
    const hasDecimal = number.includes('.');
    const hasComma = original.includes(',');
    const obj = { value: 0 };
    gsap.fromTo(obj, { value: 0 }, {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: counter, start: 'top 88%', once: true },
      onUpdate() {
        let value: string | number = hasDecimal ? obj.value.toFixed(1) : Math.floor(obj.value);
        if (hasComma && !hasDecimal) value = Number(value).toLocaleString();
        textEl.textContent = prefix + value + suffix;
      },
    });
  }
}

/* ===================================================================== */

export async function initAnimations() {
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clicks();
    root.classList.add('w-mod-ix3');
    return;
  }
  // SplitText measures lines, so wait for the web fonts (max 2 s).
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 2000))]);

  hovers();
  mouseFollow();
  clicks();
  scrollReveals();
  textScrub();
  stickySections();
  loops();
  counters();
  pageLoad();

  root.classList.add('w-mod-ix3');
  window.dispatchEvent(new CustomEvent('vexan:animations-ready'));

  // Images change section heights: recalculate trigger positions once everything has loaded.
  if (document.readyState === 'complete') ScrollTrigger.refresh();
  else window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
