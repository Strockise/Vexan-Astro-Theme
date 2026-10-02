/**
 * Slider (`.w-slider`): dependency-free replacement for the Webflow slider runtime.
 * Supports data-animation="slide", data-duration, data-easing, data-infinite, data-autoplay,
 * data-delay, numbered/round dots (`.w-slider-nav.w-num`), arrows, keyboard and touch swipe.
 */

function initSlider(root: HTMLElement) {
  const mask = root.querySelector<HTMLElement>(':scope > .w-slider-mask');
  if (!mask) return;
  const slides = Array.from(mask.querySelectorAll<HTMLElement>(':scope > .w-slide'));
  if (!slides.length) return;
  const left = root.querySelector<HTMLElement>(':scope > .w-slider-arrow-left');
  const right = root.querySelector<HTMLElement>(':scope > .w-slider-arrow-right');
  const nav = root.querySelector<HTMLElement>(':scope > .w-slider-nav');

  const duration = Number(root.dataset.duration ?? 500);
  const easing = root.dataset.easing || 'ease';
  const infinite = root.dataset.infinite !== 'false';
  const autoplay = root.dataset.autoplay === 'true';
  const delay = Number(root.dataset.delay ?? 4000);
  const swipe = root.dataset.disableSwipe !== 'true';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let index = 0;
  let timer: number | undefined;

  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carousel');
  mask.setAttribute('aria-live', 'off');

  const dots: HTMLElement[] = [];
  if (nav) {
    nav.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'w-slider-dot';
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', i === 0 ? '0' : '-1');
      dot.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}`);
      if (nav.classList.contains('w-num')) dot.textContent = String(i + 1);
      const spacing = root.dataset.navSpacing;
      if (spacing) dot.style.marginLeft = dot.style.marginRight = `${spacing}px`;
      dot.addEventListener('click', () => go(i));
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); }
      });
      nav.appendChild(dot);
      dots.push(dot);
    });
  }

  [left, right].forEach((arrow, i) => {
    if (!arrow) return;
    arrow.setAttribute('role', 'button');
    arrow.setAttribute('tabindex', '0');
    arrow.setAttribute('aria-label', i === 0 ? 'previous slide' : 'next slide');
    arrow.addEventListener('click', () => (i === 0 ? prev() : next()));
    arrow.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); i === 0 ? prev() : next(); }
    });
  });

  function render(animate: boolean) {
    const transition = animate && !reduce ? `transform ${duration}ms ${easing}` : 'none';
    slides.forEach((slide, i) => {
      slide.style.transition = transition;
      slide.style.transform = `translateX(${-index * 100}%)`;
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('w-active', i === index);
      dot.setAttribute('aria-pressed', String(i === index));
      dot.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    if (!infinite) {
      left?.classList.toggle('w-slider-arrow-disabled', index === 0);
      right?.classList.toggle('w-slider-arrow-disabled', index === slides.length - 1);
    }
  }

  function go(i: number) {
    const last = slides.length - 1;
    index = infinite ? (i + slides.length) % slides.length : Math.max(0, Math.min(last, i));
    render(true);
    restart();
  }
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  function restart() {
    if (!autoplay || reduce) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(next, delay + duration);
  }

  if (swipe) {
    let startX = 0, startY = 0, tracking = false;
    mask.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    mask.addEventListener('touchend', (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    });
  }

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  render(false);
  restart();
}

export function initSliders() {
  document.querySelectorAll<HTMLElement>('.w-slider').forEach(initSlider);
}
