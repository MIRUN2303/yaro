# YARO — Website Documentation

## Overview

YARO is a luxury streetwear brand website with a dark glass-morphism aesthetic. The site features a custom cursor system, cinematic slide transitions, product catalog with filtering, multi-cart system, and interactive product pages.

---

## File Structure

```
D:\web practice\YARO\
├── index.html             Hero/landing page — glass frame, slider, CTA
├── store.html        Product catalog — grid, search, category filter
├── cart.html              Shopping cart — multi-bucket, map, promo codes
├── product.html           Product detail — gallery, sizes, reviews
├── styles.css             Shared header, footer, search bar
├── YARO-Brand-Guidelines.html  Internal design system doc
├── AGENTS.md              This file
├── images/
│   ├── mini_hoodie.png
│   ├── mini_logo_tee.png
│   ├── oversized_drop_shoulder.png
│   ├── relaxed_fit_sweatshirt.png
│   ├── crop_lacroix_tee.png
│   ├── shadow_cargo_pant.png
│   ├── violet_haze_hoodie.png
│   ├── obsidian_lava_tee.png
│   └── detail_pics/
│       ├── center_model.png
│       ├── left_back.png
│       └── right_front.png
├── aesthetic_modal.py     Dev: bottom-sheet modal CSS rewrite
├── inline_modal.py        Dev: grid-animated modal
├── overlay_restore.py     Dev: revert inline_modal changes
├── remove_meter.py        Dev: remove Style Profile feature
├── scratch_restore.py     Dev: remove duplicate code block
├── tight_grid.py          Dev: tighten category grid layout
└── temp.txt               Temp backup of CSS fragments
```

---

## HTML Pages

### `index.html` — Hero Landing Page
- **Purpose:** Cinematic portal with full-screen glass frame, auto-looping slides, CTA
- **CSS:** All embedded in `<style>` in `<head>` — no external CSS
- **JS:** GSAP 3.12.2 (CDN) + embedded inline script
- **Sections:**
  - `.yaro-screen` — full-screen container
  - `.glass-layer` — beveled glass frame with specular highlights, noise texture, grid overlay, obsidian stone SVGs, ambient glows
  - `#yaro-title` — YARO logo (Pilowlava), each character in `<span class="char">`
  - `.brand-content` — subtitle
  - `.cta-wrapper` / `.cta-btn` — Explore Collection CTA with impulse border + sparks
  - `.pagination-dots` — 3-dot slide indicator
  - `#slide-2` — Best Seller Gallery (desktop: 3-card + circuit wires; mobile: 1-by-1 carousel)
  - `#slide-3` — Featured Offer
  - Custom cursor: `.cursor-dot`, `.cursor-ring`, `#cursor-canvas`
  - `.page-transition` overlay
- **Animations:**
  - Intro reveal: glow sweep, logo drops from above (blur → clear), subtitle fade, CTA fade
  - Auto-looping slide system (3 slides, durations: 2500/7000/4500ms)
  - GSAP logo hover scatter (4 characters fly apart)
  - Magnetic pull on CTA (mouse-follow, 8px clamp)
  - Impulse border animation (`@property --impulse-angle`, conic gradient)
  - Desktop gallery: SVG circuit wire sparks + dual pulse rings
  - Mobile gallery: 1-by-1 carousel (2s cycle)
  - Page transition overlay on link clicks

### `store.html` — Product Catalog
- **Purpose:** Product grid with search and category filter modal
- **CSS:** Embedded + links `styles.css`
- **JS:** GSAP CDN + 3 inline scripts
- **Sections:**
  - `.site-header` (shared styles.css) — logo, search, nav
  - `.glass-frame` with ambient glows
  - Hero banner: floating orbs, SVG illustrations, dust particles, light sweep
  - Category filter modal (`.cat-modal-overlay` / `.cat-modal`) — 15 category cards
  - Search bar with clear button
  - Product grid — 8 product cards (3-col desktop, 2-col mobile)
  - Custom cursor + page transition overlay
  - Footer (shared styles.css)
- **Interactions:**
  - Category filter: modal with staggered card entry, AND logic with search
  - Search: filters by name AND category
  - Product cards: hover lift (-8px), image scale (1.05), overlay with Quick View
  - Page transitions on link clicks
  - Custom cursor: negative inversion on filter button (mix-blend-mode: difference)

### `cart.html` — Shopping Cart
- **Purpose:** Multi-bucket cart with order summary, promo codes, urgency timer, Leaflet map
- **CSS:** Embedded + links `styles.css` + Leaflet CSS (unpkg)
- **JS:** GSAP + Leaflet + embedded inline script (~540 lines)
- **Sections:**
  - Fixed `.site-header`
  - `.glass-frame` with ambient glows
  - Cart header with item count + "Clear All"
  - Urgency timer (15:00 countdown)
  - Cart items with multi-bucket tabs
  - Order summary (subtotal, shipping, discount, tax, total)
  - Free shipping progress bar (₹699 threshold)
  - Promo code input (YARO10, WELCOME, FLASH20)
  - Checkout button with loading spinner
  - Trust badges (4)
  - Delivery Location: address form + Leaflet map (dark tiles, draggable marker)
  - Related Suggestions grid (4 random products)
  - Modals: Remove Confirm, Order Success, Quick Add
  - Toast notification system
  - Custom cursor (simplified — no canvas trail)
- **Interactions:**
  - Multi-bucket system (up to 3 baskets, localStorage `yaro_buckets`)
  - Quantity +/- with stock limits
  - Geolocation detection + Leaflet map
  - Promo code validation
  - Order success modal with generated ID
  - GSAP stagger entrance animation
  - `?added=` URL param for Buy Now redirect

### `product.html` — Product Detail
- **Purpose:** Product detail with image gallery, size selector, buy/cart modals, reviews
- **CSS:** Embedded + links `styles.css`
- **JS:** GSAP CDN + 2 inline scripts
- **Sections:**
  - Fixed `.site-header`
  - Floating `.back-btn` (←)
  - `.glass-frame` with ambient glows
  - Product layout: image showcase (thumbnails + arrows) / info + size selector + actions
  - Size selector (S-XXL, 5 buttons) with liquid swelling ink effect
  - Actions: "Buy Instant Now" (sparkle) + "Add to Luxury Cart" (purple swelling circle)
  - Specs accordion section
  - Related Essentials carousel (drag + arrow nav)
  - Customer Reviews: star rating, review submission, review modal
  - Modals: Buy Now confirm (qty), Bucket Selector, Review
  - Toast notifications
  - Footer (styles.css)
  - **No custom cursor** (content page design choice)
- **Interactions:**
  - Image gallery: thumbnails + fade/blur GSAP transition, arrow nav, mobile swipe
  - Size buttons: elastic bounce on click
  - Action buttons: distinct CSS animations (sparkle chase / swelling circle)
  - Bucket selector (same multi-cart system)
  - Related carousel: drag/swipe + spring bounds
  - Reviews: star hover/click, character counter, see-more toggle
  - Page transition: slide-up reveal on entry
  - Dynamic data from `productsDB` array (8 products)

---

## CSS Architecture

### `styles.css` (221 lines) — Shared
- `:root` variables: `--border`, `--accent`, `--accent-dim`
- `.site-header`: fixed 52px bar, Pilowlava logo 18px, nav links 11px uppercase
- `.sh-search`: pill-shaped 140px (→200px on focus), icon color transition
- `.site-footer`: flex, copyright + links, 11px muted
- `@media (max-width: 820px)`: 46px header, smaller logo, narrower search, column footer

### Page-level CSS (embedded in each page's `<style>`)
- Each page has its own complete style block
- Design tokens vary slightly per page (re-declared in `:root`)
- Shared easing curves:
  - `cubic-bezier(0.22, 1, 0.36, 1)` — primary GSAP-style ease
  - `cubic-bezier(0.19, 1, 0.22, 1)` — buttons, cards
  - `cubic-bezier(0.16, 1, 0.3, 1)` — modal entrances
  - `cubic-bezier(0.4, 0, 0.2, 1)` — page transitions

### Glass Morphism Pattern
- Layered radial gradients (violet/purple atmospheric tones)
- Beveled border: bright top-left, dark bottom-right
- Inner shadows: specular top-left, depth bottom-right
- Multiple outer drop-shadows for 3D depth
- Noise overlay: SVG `feTurbulence`, `mix-blend-mode: overlay`
- Grid overlay: `linear-gradient` lines at 80px intervals
- `backdrop-filter: blur()` on CTA, modals, header

---

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| Accent Violet | `#c4b5fd` | Hover states, badges, accents |
| Deep Violet | `rgba(139, 92, 246, 1)` | Cursor hover, button ink, glows |
| Background | `#050505` | Page backgrounds |
| White | `#ffffff` | Primary text |
| Danger | `#ef4444` | Discounts, errors |
| Success | `#22c55e` | Success toasts |
| Warning | `#f59e0b` | Stock warnings |
| Star/Amber | `#fbbf24` | Star ratings |

### Typography
- **Pilowlava** — Logo hero text only (index title, collection banner, brand guidelines)
- **Clash Display** (200-700) — ALL other UI

---

## JavaScript Architecture

### Cursor System (index, collection, cart)
- 3 layers: `.cursor-dot` (3px), `.cursor-ring` (24px), `#cursor-canvas` (trail)
- Dot lerp: `0.25` | Ring lerp: `0.15` (index), `0.1` (collection), `0.12` (cart)
- Trail: 18-point history, canvas draw with violet decay
- Hover states via CSS `:has()` + JS `.hovering` class fallback
- States: `.hovering`, `.on-logo`, `.clicking`, `.hidden`
- Mobile: hidden at ≤820px or `hover: none`

### Slide System (index.html)
- `goToSlide(index)` — GSAP timeline, 3 slides
- Auto-loop: `setTimeout` chain with `SLIDE_DURATIONS`
- Directional entry/exit (forward = top, loop = special)
- Slide 1 desktop: circuit wire sparks (`stroke-dashoffset`), pulse rings, `.pop-straight` cards
- Slide 1 mobile: 1-by-1 carousel, `setInterval` 2000ms
- Safety interval: resets `isTransitioning` if stuck >3s

### Page Transitions
- **index.html:** Opacity overlay `#070509` + backdrop-filter blur(20px) + violet glow. Content scales+blurs before nav.
- **store.html:** Same overlay. On load: fade-out with stagger reveal.
- **product.html:** `translateY` slide overlay (covers/uncoveres content).

### CTA Button Magnetic Pull (index.html)
- `mousemove` → `translate(dx, dy)` clamped to 8px max, `requestAnimationFrame`
- `mouseleave` → reset transform

### Logo Interaction (index.html)
- Hover → `rotationX: -10, rotationY: 5` on container
- Characters scatter with handcrafted offsets (`CHAR_OFFSETS`)
- Resize listener adjusts position per slide

### Cart System (cart.html + product.html)
- `productsDB` array (8 products)
- `yaro_buckets` in localStorage: `{ items: [] }`
- Functions: `saveBuckets`, `getBucketNames`, `bucketTotalItems`, `updateCartCount`, `renderCart`, `updateSummary`
- Promo codes: YARO10 (10%), WELCOME (15%), FLASH20 (20%)
- Urgency timer: 15min countdown

### Search (all pages)
- Header search → Enter → navigates to `store.html?search=...`
- Collection search filters by name + category

### Product Detail (product.html)
- Active product from URL `?id=`
- Gallery: `renderGallery()`, `selectImage(index)`, `navImage(dir)` — GSAP fade+blur
- Size buttons: elastic bounce
- Buy Now → bucket select → "Processing" → redirect to `cart.html?added=...`
- Reviews: star hover/click, character counter

### Toast System
- `showToast(message, type)` — slide-in animation, auto-dismiss 3.5s
- Colors: green (success), red (error)

---

## CTA Button — Detailed Breakdown (index.html)

### HTML Structure
```html
<div class="cta-wrapper" id="cta-wrapper">
  <a href="store.html" class="cta-btn interactive-elem" id="cta-explore">
    <span class="btn-text">Explore Collection</span>
    <span class="arrow">→</span>
    <span class="spark left"></span>
    <span class="spark right"></span>
  </a>
</div>
```

### CSS Layers (bottom→top)
1. **`.cta-btn`** — glass background `rgba(255,255,255,0.06)`, `backdrop-filter: blur(20px)`, emboss shadows, pill shape (`border-radius: 100px`), `border: none`
2. **`::after`** — glass sweep: `linear-gradient(105deg, transparent→white→transparent)`, animated via `background-position` (not transform, so no overflow). 4s cycle, 75% idle then sweep.
3. **`::before`** — impulse border ring: `inset: -1px; padding: 3px`, creates a 3px ring (1px outside, 2px inside). Visible only in the padding area via `mask-composite: exclude` mask. `conic-gradient` with `from var(--impulse-angle)` provides the chasing white+violet impulses. Multilayer `drop-shadow` for gradient glow.
4. **`.spark.left` / `.spark.right`** — 3 particles each (element + `::before` + `::after`). Burst outward from sides when impulse crosses, synced to impulse cycle.

### Impulse Animation Mechanics
- `@property --impulse-angle` registers an animatable `<angle>` custom property
- `::before` has a `conic-gradient` using `from var(--impulse-angle)`
- `@keyframes impulseFlow` animates `--impulse-angle` from `0deg` to `360deg`
- The border ring stays **static** — only the gradient colors flow along it
- Impulse white at 0° (relative), violet at 180°
- Ring always shows subtle `rgba(255,255,255,0.1)` — the impulses are bright highlights on a continuous visible border

### Spark Particle System
- Each side has 3 particles (main + `::before` + `::after`)
- `sparkLeft` (main) shoots straight left, `sparkLeft1` shoots upper-left, `sparkLeft2` shoots lower-left
- Same pattern for right side (mirrored)
- Burst triggers at 25% and 75% of the animation cycle (matches impulse reaching the sides)
- Burst: scale 0.3→1→0.1, opacity 0→1→0, translate outward 14px
- Staggered by 1-2% delay per particle

### Speed
- **Idle:** 4s cycle
- **Hover:** 1.5s cycle (speeds up impulse + sparks)
- Set via `.cta-btn:hover::before { animation-duration: 1.5s; }` and `.cta-btn:hover .spark { animation-duration: 1.5s; }`

### Magnetic Pull (JS)
- `mousemove` event → `(e.clientX - center) * 0.25` → clamped to 8px max distance
- Applied as `transform: translate(dx, dy)` — overrides hover `translateY(-2px)` while mouse moves
- `mouseleave` clears transform

### Cursor Integration
- CSS `body:has(.cta-btn:hover)` → dot turns violet, ring expands (44px) with lava glow
- JS fallback via `.interactive-elem` class toggles `.hovering` class on cursor elements

---

## Key Animation Patterns

### Glass Sweep (CTA `::after`)
```
background-position: -100% 0 → 200% 0
4s ease-in-out, 75% idle
```

### Impulse Flow (CTA `::before`)
```
@property --impulse-angle: 0deg → 360deg
4s linear (idle), 1.5s (hover)
```

### Spark Burst
```
opacity: 0 → 1 → 0
scale: 0.3 → 1 → 0.1
translateX/Y: 0 → outward 14px
4s cycle, staggered by 1-2%
```

### Lava Spin (Cursor Ring `::after`)
```
conic-gradient rotation via transform: rotate
2.5s linear infinite
```

### Slide Transitions
```
exit: opacity 0, scale 0.85, blur(12px) — 0.5s
entry: opacity 1, scale 1, blur(0) — 0.8s
loop: 1.1s, sine.inOut, inner blur 25px + scale 0.45
```

### Page Transitions
```
index/collection: opacity overlay + content scale 0.97 + blur
product: translateY overlay slide-up/down
GSAP duration: 0.25-0.65s
```

---

## Mobile Breakpoints

| Breakpoint | Pages | Changes |
|---|---|---|
| ≤960px | cart, product | Single column layout |
| ≤820px | ALL | Cursor hidden, glass frame reduced, CTA arrow+sparks hidden, slide 1→1-by-1 carousel |
| ≤600px | cart, product | Tight padding, smaller elements |

---

## Dev Scripts (Python)

All Python scripts are development tooling that modify HTML/CSS/JS programmatically to iterate on the collection page's category filter modal. Each script targets specific sections and can be re-run.

| Script | Action |
|---|---|
| `aesthetic_modal.py` | Bottom-sheet modal CSS rewrite |
| `inline_modal.py` | Grid-animated modal with 0fr→1fr |
| `overlay_restore.py` | Revert to full-screen overlay modal |
| `remove_meter.py` | Remove Style Profile feature |
| `scratch_restore.py` | Remove duplicate code block from index.html |
| `tight_grid.py` | Compact category grid layout |

---

## localStorage Keys

| Key | Purpose | Used In |
|---|---|---|
| `yaro_buckets` | Multi-basket cart data | cart.html, product.html |

---

## URL Parameters

| Param | Purpose | Page |
|---|---|---|
| `?id=N` | Select product (0-7) | product.html |
| `?search=...` | Pre-fill search | store.html |
| `?added=name` | Show added toast | cart.html |
