# Styling and Theming

This template does **not** use Tailwind CSS and has **no dark mode or theme switcher**. Styling is the original design system in plain CSS:

| File | Role | Edit? |
|---|---|---|
| `src/styles/normalize.css` | Reset | No |
| `src/styles/webflow.css` | Base layout/component styles (`w-*` classes) | No |
| `src/styles/vexan.webflow.css` | The design system: tokens, typography, every section | Tokens yes, rules carefully |
| `src/styles/custom.css` | Your additions + the animation guard | Yes |

All four are imported once in `BaseLayout.astro`, in that order. Keep them global: don't move these classes into scoped `<style>` blocks.

## Design tokens

CSS custom properties at the top of `vexan.webflow.css`, for example:

- Colors: `--_colors---main-color--primary-color`, `--_colors---main-color--black-color`, `--_colors---nutral-color--500`…
- Typography: `--_typography---font-family--heading-font-family`, `--_typography---h1--font-size`…
- Spacing: `--fixed-sizes--size-*`, `--spacers--spacer-*`

Changing a token restyles every element that uses it. Fonts (Geist, Inter Tight) are loaded in `BaseLayout.astro`.

## Breakpoints

Desktop first: base → `max-width: 991px` (tablet) → `767px` (mobile landscape) → `479px` (mobile). Large screens: `min-width: 1280px / 1440px / 1920px`. The navbar collapses at 991px.

## Component variants

Variants are extra classes, e.g. `primary-button w-variant-d027…` (white). Use the component props (`<PrimaryButton variant="v2">`) instead of writing the classes by hand.

## Animations

`src/scripts/animations.ts` rebuilds the Webflow interactions with GSAP. Opt in with attributes:

| Attribute | Effect |
|---|---|
| `page-load-1/3/4/5` | Fade up on load (0 / .4 / .6 / .8 s) |
| `page-scroll-1/2/3` | Fade up on scroll (0 / .4 / .6 s) |
| `top-delay-0/2/3` | Fade up on scroll (0 / .2 / .4 s) |
| `heading-style-1` / `heading-style-2` | Masked line reveal on load / on scroll |
| `scroll-list`, `delay-02`, `load-stagger` | Staggered children |

Class-based effects (button hovers, marquees, sticky horizontal sections, text highlight scrubs, FAQ accordion) are wired by class name, so they work wherever that markup is reused. Elements stay hidden until GSAP has set their start state (`html.w-mod-js:not(.w-mod-ix3)` guard in `custom.css`). `prefers-reduced-motion` disables all animations.

## Adding Tailwind (optional)

Tailwind v4 can be added (`npx astro add tailwind`), but keep the existing CSS files: the markup depends on them. Disable Tailwind's preflight reset if it conflicts with `normalize.css`.
