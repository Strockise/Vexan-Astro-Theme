/**
 * Navbar (`.w-nav`): a dependency-free port of the Webflow navbar runtime.
 * Below the collapse breakpoint the menu is moved into a `.w-nav-overlay`, gets
 * `data-nav-menu-open` and slides in (data-animation="over-right"), exactly like webflow.js.
 */

const KEY = { SPACE: ' ', ENTER: 'Enter', ESC: 'Escape' };

interface NavState {
  el: HTMLElement;
  menu: HTMLElement;
  buttons: HTMLElement[];
  overlay: HTMLElement;
  parent: HTMLElement;
  prev: Element | null;
  open: boolean;
  busy: boolean;
  config: { animOver: boolean; direction: 1 | -1; duration: number; easing: string; easing2: string };
}

function readConfig(el: HTMLElement): NavState['config'] {
  const animation = el.dataset.animation || 'default';
  const duration = el.dataset.duration != null ? Number(el.dataset.duration) : 400;
  return {
    animOver: /^over/.test(animation),
    direction: /left$/.test(animation) ? -1 : 1,
    duration,
    easing: el.dataset.easing || 'ease',
    easing2: el.dataset.easing2 || 'ease',
  };
}

const isCollapsed = (s: NavState) => getComputedStyle(s.buttons[0]).display !== 'none';
const bodyHeight = () => parseFloat(getComputedStyle(document.body).height) || document.body.offsetHeight;

function setExpanded(s: NavState, value: boolean) {
  s.buttons.forEach((b) => b.setAttribute('aria-expanded', String(value)));
}

function openNav(s: NavState) {
  if (s.open) return;
  s.open = true;
  s.menu.setAttribute('data-nav-menu-open', '');
  s.buttons.forEach((b) => b.classList.add('w--open'));

  const height = bodyHeight();
  if (s.config.animOver) s.menu.style.height = `${height}px`;
  s.overlay.style.height = `${height}px`;

  const width = s.menu.offsetWidth;
  const menuHeight = s.menu.offsetHeight;
  const navHeight = s.el.offsetHeight;

  s.prev = s.menu.previousElementSibling;
  s.overlay.style.display = 'block';
  s.overlay.appendChild(s.menu);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || s.config.duration <= 0;
  if (reduce) { setExpanded(s, true); return; }

  s.menu.style.transition = 'none';
  if (s.config.animOver) {
    s.overlay.style.width = `${width}px`;
    s.menu.style.transform = `translateX(${s.config.direction * width}px)`;
  } else {
    s.menu.style.transform = `translateY(${-(navHeight + menuHeight)}px)`;
  }
  void s.menu.offsetWidth; // force reflow so the transition runs
  s.menu.style.transition = `transform ${s.config.duration}ms ${s.config.easing}`;
  s.menu.style.transform = 'translateX(0px) translateY(0px)';
  s.menu.addEventListener('transitionend', () => setExpanded(s, true), { once: true });
}

function finishClose(s: NavState) {
  s.menu.style.height = '';
  s.menu.style.transition = '';
  s.menu.style.transform = '';
  s.menu.removeAttribute('data-nav-menu-open');
  if (s.overlay.contains(s.menu)) {
    if (s.prev && s.prev.parentElement === s.parent) s.prev.after(s.menu);
    else s.parent.prepend(s.menu);
    s.overlay.setAttribute('style', '');
    s.overlay.style.display = 'none';
  }
  setExpanded(s, false);
  s.busy = false;
}

function closeNav(s: NavState, immediate = false) {
  if (!s.open) return;
  s.open = false;
  s.buttons.forEach((b) => b.classList.remove('w--open'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || s.config.duration <= 0;
  if (immediate || reduce) { finishClose(s); return; }

  s.busy = true;
  const width = s.menu.offsetWidth;
  const menuHeight = s.menu.offsetHeight;
  const navHeight = s.el.offsetHeight;
  s.menu.style.transition = `transform ${s.config.duration}ms ${s.config.easing2}`;
  s.menu.style.transform = s.config.animOver
    ? `translateX(${width * s.config.direction}px)`
    : `translateY(${-(navHeight + menuHeight)}px)`;
  let done = false;
  const end = () => { if (!done) { done = true; finishClose(s); } };
  s.menu.addEventListener('transitionend', end, { once: true });
  window.setTimeout(end, s.config.duration + 50);
}

function initNav(el: HTMLElement, index: number) {
  const menu = el.querySelector<HTMLElement>('.w-nav-menu');
  const buttons = Array.from(el.querySelectorAll<HTMLElement>('.w-nav-button'));
  if (!menu || !buttons.length) return;

  const overlayId = `w-nav-overlay-${index}`;
  const overlay = document.createElement('div');
  overlay.className = 'w-nav-overlay';
  overlay.id = overlayId;
  el.appendChild(overlay);

  const state: NavState = {
    el, menu, buttons, overlay,
    parent: menu.parentElement as HTMLElement,
    prev: null, open: false, busy: false,
    config: readConfig(el),
  };

  buttons.forEach((b) => {
    b.setAttribute('role', 'button');
    b.setAttribute('tabindex', '0');
    b.setAttribute('aria-controls', overlayId);
    b.setAttribute('aria-haspopup', 'menu');
    b.setAttribute('aria-expanded', 'false');
    if (!b.hasAttribute('aria-label')) b.setAttribute('aria-label', 'menu');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.busy) return;
      state.open ? closeNav(state) : openNav(state);
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === KEY.SPACE || e.key === KEY.ENTER) {
        e.preventDefault();
        state.open ? closeNav(state) : openNav(state);
      } else if (e.key === KEY.ESC) {
        e.preventDefault();
        closeNav(state);
      }
    });
  });

  // Close when a same-page anchor in the menu is clicked.
  menu.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link && link.getAttribute('href')?.startsWith('#') && state.open) closeNav(state);
  });

  // Close on Escape anywhere inside the nav, and on outside clicks.
  el.addEventListener('keydown', (e) => {
    if (e.key === KEY.ESC && state.open) {
      closeNav(state);
      buttons[0].focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!state.open) return;
    if (!(e.target as HTMLElement).closest('.w-nav-menu')) closeNav(state);
  });

  // Above the breakpoint the menu must be in its normal place.
  window.addEventListener('resize', () => {
    if (state.open && !isCollapsed(state)) closeNav(state, true);
    else if (state.open) {
      const h = bodyHeight();
      if (state.config.animOver) state.menu.style.height = `${h}px`;
      state.overlay.style.height = `${h}px`;
    }
  });
}

export function initNavs() {
  document.querySelectorAll<HTMLElement>('.w-nav').forEach(initNav);
}
