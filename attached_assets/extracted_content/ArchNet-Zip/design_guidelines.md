# ArchNet Design Guidelines

## Design Approach
**Selected Framework:** Hybrid approach combining Material Design's structural clarity with contemporary architectural/tech aesthetic inspired by Linear, Vercel, and Stripe. Focus on clean geometry, precise spacing, and professional sophistication.

## Typography System

**Primary Font:** Inter (Google Fonts)
- Hero Headlines: font-bold text-5xl md:text-7xl tracking-tight
- Section Headers: font-semibold text-3xl md:text-5xl
- Subheadings: font-medium text-xl md:text-2xl
- Body Text: font-normal text-base md:text-lg leading-relaxed
- Captions/Labels: font-medium text-sm uppercase tracking-wide

**Secondary Font:** JetBrains Mono (code/technical elements)
- Used sparingly for technical specs, data displays

## Layout System

**Spacing Units:** Tailwind utilities: 4, 8, 12, 16, 20, 24, 32
- Component padding: p-8 to p-16
- Section spacing: py-20 md:py-32
- Card gaps: gap-8 md:gap-12
- Container max-width: max-w-7xl

**Grid System:**
- Desktop: 3-column for features/services grid-cols-1 md:grid-cols-3
- Tablet: 2-column for content blocks md:grid-cols-2
- Mobile: Single column stack

## Component Library

### Navigation
- Sticky header with blur backdrop (backdrop-blur-xl)
- Logo left, primary nav center, CTA button right
- Mobile: Hamburger menu with slide-out drawer

### Hero Section
- Full-viewport impact section with large background image
- Headline + supporting text overlay on gradient overlay (dark to transparent)
- Dual CTAs (primary + secondary ghost button) with backdrop-blur-md bg-white/10 treatment
- Subtle animated scroll indicator

### Feature Cards
- Elevated cards with subtle shadow (shadow-lg hover:shadow-2xl)
- Icon (Heroicons) + Title + Description layout
- Rounded corners (rounded-2xl)
- Hover lift effect (transition-transform hover:-translate-y-2)

### Data/Stats Display
- 4-column grid on desktop showcasing key metrics
- Large numbers (text-4xl font-bold) with labels below
- Dividing borders between columns

### Content Sections
- Alternating two-column layouts (image + text)
- 60/40 split favoring content or imagery alternately
- Breathing room with generous py-24

### Contact/CTA Sections
- Full-width banner with gradient background
- Centered content with max-w-4xl
- Form with floating labels, rounded inputs (rounded-lg)

### Footer
- Multi-column layout: Brand/About (2 cols) + Quick Links + Contact + Social
- Newsletter signup embedded
- Trust badges/certifications row
- Copyright bar at bottom

## Images

**Hero Image:** 
- Full-width architectural photograph or abstract network visualization
- High-quality, professional imagery (1920x1080 minimum)
- Subtle gradient overlay for text legibility
- Position: Top of homepage

**Section Images:**
- Alternating content blocks: 3-4 professional images showcasing architecture/technology
- Image sizes: ~800x600px, optimized for web
- Use throughout: team photos, project showcases, office environment

**Feature Icons:**
- Heroicons (outline style) at 24x24 or 32x32px
- Consistent stroke width throughout

## Animations

**Minimal & Purposeful:**
- Scroll-triggered fade-ins for sections (opacity + translateY)
- Hover state transitions (0.3s ease)
- Page load hero fade-in (0.8s)
- NO parallax, NO complex scroll animations

## Key Design Principles

1. **Professional Precision:** Sharp edges, perfect alignment, generous whitespace
2. **Architectural Rhythm:** Consistent vertical spacing creating visual cadence
3. **Hierarchy Through Scale:** Bold type contrasts, not color dependency
4. **Purposeful Density:** Rich content sections without clutter
5. **Trust Through Polish:** Every detail considered, production-quality finish

## Accessibility
- Semantic HTML throughout
- Focus states on all interactive elements (ring-2 ring-offset-2)
- ARIA labels for icon buttons
- Minimum contrast ratios maintained
- Keyboard navigation support

**Component Count:** 8-10 distinct sections creating comprehensive, feature-rich experience demonstrating depth and sophistication.