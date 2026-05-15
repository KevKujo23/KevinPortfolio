## IMPLEMENTATION — Aurora Codex Redesign (Kevin Lapuz Portfolio)

### CONTEXT
- **Stack:** Plain HTML / CSS / vanilla JS. Zero build step. GitHub Pages deployable as-is.
- **Agent target:** Claude Code
- **Project type:** Existing codebase
- **Repo root:** `C:\Users\kevin\Documents\Work\KevinPortfolio`
- **Conventions to respect:**
  - All content is driven by `window.PORTFOLIO_CONTENT` in `assets/js/content.js` — DO NOT touch the data shape or values.
  - Rendering, nav, reveals, lightbox all live in `assets/js/main.js` and read from `window.PORTFOLIO_CONTENT`.
  - Theming uses CSS custom properties in `:root` inside `assets/css/styles.css`.
  - No npm deps, no bundlers, no JSX, no TypeScript. Everything must run by opening `index.html` directly.
- **Recon findings (already completed — do not re-run):**
  - Entry: `index.html` (sections: hero, about, projects, skills, experience, contact + lightbox + footer)
  - `index.html` IDs to preserve: `#hero`, `#about`, `#projects`, `#skills`, `#experience`, `#contact`, `#projects-grid`, `#skills-groups`, `#skills-list`, `#experience-list`, `#hero-name`, `#hero-typed-text`, `#hero-tagline`, `#hero-location-pill`, `#hero-availability-pill`, `#hero-focus`, `#profile-image`, `#brand-name`, `#footer-name`, `#footer-year`, `#nav-resume-link`, `#about-copy`, `#about-role`, `#about-location`, `#about-email-link`, `#availability-note`, `#contact-email-link`, `#contact-github-link`, `#contact-linkedin-link`, `#contact-resume-link`, hero social links (`#hero-linkedin-link`, `#hero-github-link`, `#hero-email-link`, `#hero-resume-link`), project lightbox (`#project-image-lightbox`, `#project-lightbox-image`, `#project-lightbox-caption`, `#project-lightbox-close`).
  - `main.js` queries the above IDs + reads `[data-nav-list]`, `[data-nav-toggle]`, `[data-nav-link]`, `[data-section]`, `[data-project-image-trigger]`, `[data-lightbox-close]`. These attribute hooks must continue to work.
  - Content.js currently exposes 6 projects, 23 skills, 3 skill groups, 2 experience entries. Section "experience" has the `hidden` attribute and is unhidden by main.js when items exist.

### OBJECTIVE
Replace the current visual design with the **Aurora Codex** direction — a bold, dark-by-default, glass + aurora aesthetic with animated gradient blobs, a custom cursor, magnetic buttons, 3D-tilt project cards, and an asymmetric featured-first project layout — while preserving 100% of the existing content, IDs, and JS rendering contract.

### PHASE 0 — ORIENT
Already done via recon (summarized above). Before writing code:
1. Re-read `index.html`, `assets/css/styles.css`, `assets/js/main.js`, `assets/js/content.js` in full to confirm the recon findings still match the current files on disk.
2. Report back: any drift from the recon summary, especially in `main.js` selector usage.

### PHASE 1 — DESIGN SYSTEM & INFRASTRUCTURE
Before touching markup or rendering, design and report back on:

**Design tokens (write into `:root` in `styles.css`):**
- Base canvas: `--bg-0: #07081a;` (deep midnight)
- Layered surfaces: `--bg-1: rgba(255,255,255,0.04);` `--bg-2: rgba(255,255,255,0.07);` (glass tiers)
- Borders: `--border-glass: rgba(255,255,255,0.10);` with hover `--border-glass-hot: rgba(255,255,255,0.22);`
- Aurora hues: `--aurora-indigo: #6366f1; --aurora-cyan: #22d3ee; --aurora-magenta: #ec4899; --aurora-gold: #fbbf24;`
- Text: `--text-primary: #f5f5fb; --text-secondary: rgba(245,245,251,0.72); --text-muted: rgba(245,245,251,0.52);`
- Accent gradient: `--gradient-aurora: linear-gradient(135deg, var(--aurora-indigo), var(--aurora-cyan) 50%, var(--aurora-magenta));`
- Glow tokens: `--glow-cool: 0 0 60px rgba(34,211,238,0.35); --glow-warm: 0 0 60px rgba(236,72,153,0.30);`
- Radii: `--radius-sm: 10px; --radius-md: 18px; --radius-lg: 28px; --radius-pill: 999px;`
- Type: display serif (`"Fraunces", "Times New Roman", serif`), body sans (`"Inter", system-ui, sans-serif`), mono (`"JetBrains Mono", ui-monospace, monospace`) — load via Google Fonts `<link>` tag (allowed: just a CDN font link, not a build step).

**Layout system:**
- Container max-width `1240px`, side gutters `clamp(20px, 4vw, 48px)`.
- Section vertical rhythm `clamp(80px, 12vh, 160px)`.
- Define a `.glass` utility class for backdrop-filter glass cards. Provide a `@supports not (backdrop-filter: blur())` fallback that uses solid `var(--bg-1)`.

**Behavior infrastructure (in `main.js`):**
- Decide where to mount: (a) animated aurora canvas/blobs, (b) custom cursor element, (c) intersection-based scroll-reveal observer, (d) per-card 3D tilt handler, (e) magnetic button handler.
- All new behaviors must:
  - No-op cleanly on touch devices (use `pointer: coarse` media query).
  - Respect `prefers-reduced-motion: reduce` — disable cursor follow, parallax, tilt, blob animation.
- Plan how to add new DOM (aurora canvas, cursor) WITHOUT changing any existing IDs or breaking the existing render functions.

**Report Phase 1 design decisions before Phase 2.**

### PHASE 2 — IMPLEMENTATION

Build in this order:

**1. `index.html` — minimal markup additions only**
- Add Google Fonts `<link>` for Fraunces, Inter, JetBrains Mono.
- Add two new top-level elements just inside `<body>`, BEFORE `<header>`:
  - `<div class="aurora-bg" aria-hidden="true"><span class="blob blob-1"></span><span class="blob blob-2"></span><span class="blob blob-3"></span><div class="grain"></div></div>`
  - `<div class="custom-cursor" aria-hidden="true"><span class="cursor-dot"></span><span class="cursor-ring"></span></div>`
- Do NOT remove or rename any existing element, ID, or `data-*` attribute.
- Update the `<title>` to `Kevin Lawrenze Lapuz — Aurora Codex`.

**2. `assets/css/styles.css` — full rewrite of the visual layer**
Rewrite the file completely. Required sections in order:
- `@import` / `@font-face` declarations (use Google Fonts link already in HTML; no @import needed)
- `:root` design tokens (see Phase 1)
- Global resets, `html` scroll-padding-top equal to header height
- `body`: dark canvas, body font Inter, `cursor: none` on `(pointer: fine)` to enable custom cursor; revert to default on touch
- `.aurora-bg`: fixed, full-viewport, behind everything (`z-index: -1`). Three `.blob` children, each `position: absolute`, `border-radius: 50%`, ~`60vw` wide, with `filter: blur(120px)` and `mix-blend-mode: screen`. Animate each with a different `@keyframes` drift (10–25s) and color (indigo / cyan / magenta). `.grain` is a fixed full-screen layer of CSS noise via SVG data URI at `opacity: 0.05`.
- `.custom-cursor`: fixed, pointer-events none, `z-index: 9999`. Dot is `8px` solid. Ring is `40px` with `border: 1.5px solid` aurora color and `transition: transform 200ms ease, width 200ms, height 200ms`. Both translated via JS-set CSS variables `--cursor-x` and `--cursor-y`.
- `.glass`: `background: var(--bg-1); backdrop-filter: blur(20px) saturate(140%); -webkit-backdrop-filter: blur(20px) saturate(140%); border: 1px solid var(--border-glass); border-radius: var(--radius-lg);`
- Header: glass strip across top, sticky, subtle border-bottom. Nav link active state uses an underline drawn via aurora gradient. Mobile nav opens as a glass overlay.
- Hero: full-viewport min-height. Left column: eyebrow in mono, headline in Fraunces (display serif) with the name wrapped in a `<span class="aurora-text">` that uses `background-clip: text` on the aurora gradient. The typed line uses mono. CTAs are pill-shaped glass buttons with a magnetic hover. Right column: profile media inside a glassy aurora-bordered hexagonal/squircle frame (use `clip-path`) with a soft outer glow. Below the avatar, the `.profile-card` becomes a small glass tile with mono label.
- About: two-column layout. Copy on left, detail list on right as a glass card. Add a subtle vertical aurora-gradient line separating columns at desktop widths.
- **Projects (signature section — go bold):**
  - Heading anchored left. Right side has a mono "06 / projects" counter pulled from `#projects-grid` length via JS (set as a `data-count` attribute or a small text node — Phase 2 step 4).
  - Layout: CSS Grid with custom template. **Asymmetric, featured-first.**
    - Project 1 (first child): full-width "hero card." Image on right (55%), copy on left (45%). Image masked with a polygon `clip-path` (e.g., angled top-right corner cut).
    - Projects 2 & 3: side-by-side 2-col row. Standard glass cards.
    - Projects 4 & 5: alternating row — project 4 image-left text-right; project 5 image-right text-left.
    - Project 6 (and any beyond): standard glass cards in 2-col row.
    - If there are fewer or more than 6 projects, gracefully degrade: still feature the first as full-width hero, then put all remaining in a 2-col grid (no alternating-row dependency on exact count).
  - Cards have:
    - `position: relative; overflow: hidden;` with an aurora gradient border via `::before` pseudo (use a 1px gradient mask trick).
    - On hover: `transform: translateY(-4px)` PLUS a 3D tilt set by JS (max ±8°). A faint aurora-color glow follows the cursor (radial-gradient `background` set via `--mx --my` CSS vars).
    - Status pill: glassy, with status-specific color (Finished / Deployed → cyan glow; In Progress → gold glow).
    - Tech chips: mono, glass background, hover lifts them with a subtle aurora ring.
- Skills: tab-like glass panels per group. Skill items render as mono chips in a wrapped flex. Hover: chip border lights up in aurora.
- Experience: vertical timeline. Each entry is a glass card. A vertical aurora-gradient line runs down the left margin with a small glowing dot per role.
- Contact: full-width glass panel with the aurora gradient as a thin top border. CTA "Email Me" is a magnetic pill. Other links are mono inline links with aurora underline on hover.
- Footer: minimal mono row, low opacity.
- Lightbox: dark glass backdrop with extra blur. Close button is a glass circle with aurora hover.
- **Section reveals (CSS side):** add `.reveal` base state (`opacity: 0; transform: translateY(24px); filter: blur(8px);`) and `.reveal.is-visible` end state (`opacity: 1; transform: none; filter: none; transition: 800ms cubic-bezier(.2,.7,.2,1);`). Stagger via `transition-delay` set inline by JS.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` — disable blob animation, disable tilt CSS vars, disable reveal blur, instant transitions, hide `.custom-cursor`, restore `cursor: auto`.
- **Mobile (`max-width: 820px`):** stack to single column everywhere; turn off custom cursor, tilt, magnetic buttons via media query that JS also reads (`matchMedia("(pointer: fine)")`); reduce hero font sizes; convert featured project card to standard stacked layout.

**3. `assets/js/main.js` — additive behavior layer**
Keep ALL existing functions and rendering intact. Add a new section near the bottom (after current logic, before any DOMContentLoaded close) that initializes:

- `initAuroraCursor()`:
  - On `mousemove`, set `document.documentElement.style.setProperty('--cursor-x', e.clientX + 'px')` and same for `y`.
  - Use `requestAnimationFrame` to update transform on `.custom-cursor`.
  - Add `cursor-hot` class to cursor when hovering any `a, button, [role="button"], [data-project-image-trigger]`.
  - Skip entirely if `!matchMedia('(pointer: fine)').matches` or `matchMedia('(prefers-reduced-motion: reduce)').matches`.

- `initMagneticButtons()`:
  - Apply to `.button-primary, .button-ghost, .nav-resume`.
  - On `mousemove` within the element bounding box, translate the element toward the cursor with a damping factor of 0.25 and max offset of 12px.
  - Reset transform on `mouseleave`.
  - Skip on coarse pointer or reduced motion.

- `initProjectTilt()`:
  - Apply to all rendered `.project-card` (or whatever class the project render function emits — verify by reading `main.js` first).
  - On `mousemove`, compute normalized cursor position within card, set CSS vars `--tilt-x`, `--tilt-y`, `--mx`, `--my`.
  - In CSS, use those vars: `transform: perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));`
  - The aurora glow uses `background: radial-gradient(circle at var(--mx) var(--my), rgba(99,102,241,0.18), transparent 40%);` on a `::after` overlay.
  - Reset on `mouseleave`.

- `initAuroraDrift()` (lightweight):
  - Listen to `scroll`, set CSS var `--scroll-y` on `:root` as `window.scrollY * 0.05 + 'px'`.
  - CSS uses `--scroll-y` to parallax-translate the aurora blobs.

- `initSectionReveals()`:
  - Replace or supplement the existing reveal observer if present. Use `IntersectionObserver` with threshold 0.12. When intersecting, add `.is-visible` AND a staggered `--reveal-delay` based on order within the section.

- `injectProjectCounter()`:
  - After projects render, find the heading container in `#projects` section. Append a mono span `<span class="section-counter">[count] / projects</span>` where `count` is `data.projects.length` padded to 2 digits.

- Make sure all new init calls run only after `window.PORTFOLIO_CONTENT` is loaded and the existing render is complete (hook into the same load path).

**4. Do NOT modify `assets/js/content.js`.**

**5. Verify deploy compatibility:** No new files outside `assets/`. No build step. Site must work via `file://` and Live Server unchanged.

### PHASE 3 — UI / UX VALIDATION
Verify before marking done:
- [ ] First load: dark canvas, three drifting aurora blobs visible, custom cursor active on desktop, hero headline animates in with stagger, name renders inside aurora gradient text.
- [ ] Interactive elements: nav links underline-on-hover with aurora; CTAs are magnetic; project cards tilt on hover with a cursor-tracking glow; tech chips lift on hover; resume button is glassy.
- [ ] Success states: clicking a project image opens the existing lightbox (must still work); clicking nav links smooth-scrolls and updates active state; mobile nav toggle opens glass overlay.
- [ ] Empty / fallback: if `experience` array is empty, section remains hidden (existing behavior preserved); if a project has no image, the existing built-in placeholder card still renders.
- [ ] Loading state: fonts fall back to system stack while loading without breaking layout (use `font-display: swap` via the Google Fonts URL).
- [ ] Responsive:
  - Mobile (≤ 480px): single column, no cursor, no tilt, no magnetic, featured project stacks vertically.
  - Tablet (481–820px): two-column where useful, custom cursor still off.
  - Desktop (≥ 821px): full effect on.
- [ ] Reduced motion: enabling `prefers-reduced-motion: reduce` in OS settings disables blob animation, cursor, tilt, magnetic, reveal blur.
- [ ] Lightbox: still functions on click of project images.
- [ ] No console errors. No layout shift on font load.

### CONSTRAINTS
- Do not change `assets/js/content.js` (data layer is owned by Kevin).
- Do not rename or remove any existing element ID or `data-*` attribute used by `main.js`.
- Do not introduce a build step, package.json, bundler, or framework. Plain HTML/CSS/JS only.
- Do not refactor unrelated code paths.
- All external assets (fonts, icons) must be CDN-linked or inlined; no npm.

### ACCEPTANCE CRITERIA (binary)
- [ ] Opening `index.html` directly in a browser (no server) renders the redesigned site with aurora background visible.
- [ ] All 6 (or N) projects from `content.js` render with the first as a full-width featured card and the rest in the alternating / grid layout.
- [ ] Custom cursor appears and follows the mouse on desktop; standard cursor is shown on touch devices.
- [ ] Hovering a project card produces a 3D tilt AND an aurora glow that follows the cursor.
- [ ] Hovering any CTA button produces a magnetic pull effect on desktop only.
- [ ] Aurora blobs visibly animate at low CPU cost (no jank on a mid-tier laptop) and parallax on scroll.
- [ ] Nav active-link highlighting still updates as the user scrolls (existing IntersectionObserver behavior preserved).
- [ ] Mobile nav toggle opens / closes correctly with the new glass styling.
- [ ] Project image lightbox still opens and closes on click and Escape.
- [ ] OS `prefers-reduced-motion: reduce` setting disables all motion-driven effects without breaking layout.
- [ ] No regressions: experience section auto-hides when empty; project placeholder card still shows for image-less projects.
- [ ] Zero new runtime dependencies; site deploys to GitHub Pages by pushing the repo as-is.

### REPORT BACK
When done, tell Kevin:
1. Every file created or changed and why.
2. Anything Phase 0 found that drifted from the recon summary above.
3. Design decisions made that weren't explicitly specified (e.g., specific blob keyframe values, exact clip-path shapes).
4. Any deferred items, known gaps, or browsers where backdrop-filter might fall back.
5. Confirmation that opening `index.html` directly works without a server, and that GitHub Pages deploy needs no extra steps.
