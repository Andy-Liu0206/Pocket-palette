---
name: Pocket Palette
colors:
  surface: '#fff8f4'
  surface-dim: '#e8d7ca'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e7'
  surface-container: '#fcebdd'
  surface-container-high: '#f6e5d7'
  surface-container-highest: '#f0e0d2'
  on-surface: '#221a12'
  on-surface-variant: '#544434'
  inverse-surface: '#382f25'
  inverse-on-surface: '#ffeee0'
  outline: '#877462'
  outline-variant: '#dac2ae'
  surface-tint: '#895100'
  primary: '#895100'
  on-primary: '#ffffff'
  primary-container: '#ff9f1c'
  on-primary-container: '#683c00'
  inverse-primary: '#ffb86b'
  secondary: '#835401'
  on-secondary: '#ffffff'
  secondary-container: '#fdbd68'
  on-secondary-container: '#764b00'
  tertiary: '#006686'
  on-tertiary: '#ffffff'
  tertiary-container: '#00c3fd'
  on-tertiary-container: '#004d66'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcbc'
  primary-fixed-dim: '#ffb86b'
  on-primary-fixed: '#2c1700'
  on-primary-fixed-variant: '#683d00'
  secondary-fixed: '#ffddb5'
  secondary-fixed-dim: '#fabb65'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#c0e8ff'
  tertiary-fixed-dim: '#70d2ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d66'
  background: '#fff8f4'
  on-background: '#221a12'
  surface-variant: '#f0e0d2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 20px
  gutter-grid: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system focuses on a **Modern Minimalist** aesthetic with a warm, editorial influence. The primary goal is to make food curation feel both organized and indulgent. The brand personality is "The Discerning Foodie"—sophisticated yet approachable, favoring high-quality imagery over dense interface elements.

The style leverages **soft minimalism** with generous white space and high-contrast photography to evoke an "appetizing" emotional response. By stripping away non-essential UI ornamentation, the design system ensures that user-generated content and restaurant photography remain the focal point. The interface should feel like a high-end digital journal rather than a utility tool.

## Colors

The palette is anchored by **Warm Orange** and **Amber**, colors scientifically associated with appetite and warmth. 

- **Primary & Secondary:** Used for high-intent actions, active states, and branding accents.
- **Soft Cream (#FDFFFC):** Serves as the global background color. It is softer on the eyes than pure white, providing a premium, "paper-like" feel that complements food photography.
- **Deep Charcoal (#2E2E2E):** Used for primary typography to ensure high legibility and a grounded, professional feel.
- **Accent Surface:** A very pale tint of the primary orange used for subtle grouping or secondary button backgrounds to maintain a monochromatic harmony.

## Typography

This design system utilizes **Plus Jakarta Sans** for headings to inject a modern, slightly rounded personality that feels welcoming. **Inter** is utilized for body text and UI labels to maintain rigorous clarity and a "pro" utilitarian feel.

Hierarchy is established through weight and scale. Large display titles are reserved for restaurant names or collection headers. Label caps are used sparingly for category tags (e.g., "ITALIAN", "WISH LIST") to provide a clear structural anchor without cluttering the visual field.

## Layout & Spacing

The system uses a **fluid mobile grid** based on an 8px rhythmic scale. 

- **Side Margins:** A consistent 20px margin is applied to all mobile screens to provide breathing room for large-format imagery.
- **Vertical Rhythm:** Elements are stacked using 16px (medium) and 32px (large) increments to differentiate between related content and new sections.
- **Grid Density:** For lists, a single-column layout is preferred to maximize the impact of "vibrant food imagery." A two-column masonry approach may be used for "Gallery View" modes where visual browsing is the primary user task.

## Elevation & Depth

Depth in this design system is achieved through **Ambient Shadows** and **Tonal Layering**. 

1. **Surface Level (Base):** The Soft Cream (#FDFFFC) background.
2. **Card Level:** Elements sit on a white surface with a very soft, diffused shadow (Y: 4, Blur: 20, Opacity: 6% Charcoal). This creates a "floating paper" effect rather than a heavy industrial feel.
3. **Active/Interactive Level:** When pressed, buttons or cards may use a slightly deeper shadow or a subtle 1px inner amber border to signify interaction.

Avoid heavy dark shadows or complex gradients; the goal is a flat, clean look with just enough shadow to indicate touchability.

## Shapes

The shape language is defined by **20px corner radii** on all primary cards and image containers. This "Rounded" approach softens the professional charcoal typography and aligns with the friendly, inviting nature of food culture.

- **Small Components:** Buttons and input fields use a slightly smaller radius (12px) to maintain structural integrity.
- **Iconography:** Use "Medium" weight line icons with rounded terminals to match the corner radii of the containers.

## Components

### Buttons
- **Primary:** Solid Warm Orange (#FF9F1C) with white text. High-rounded corners (12px or pill).
- **Secondary:** Soft Cream background with a 1px Amber (#FFBF69) border.

### Food Cards
- **Large Format:** 20px radius. Imagery should take up at least 60% of the card area. Use a subtle gradient overlay at the bottom of the image if text is placed over it.
- **Content:** Title in Headline-md, Subtitle (Location/Category) in Body-md secondary color.

### Chips & Tags
- Used for cuisine types or price points. 
- Style: Light Amber (#FFBF69 at 15% opacity) background with Deep Charcoal text.

### Navigation
- **Bottom Bar:** Minimalist icons (24px) with a 2px active indicator dot in Primary Orange. 
- **Search Bar:** Inset with a light grey border or a soft shadow, using "Soft" (8px) roundedness to distinguish it from the "Rounded" (20px) content cards.

### Input Fields
- Clean, underlined or lightly boxed. Use Soft Cream as the fill to distinguish from the page background. Focused state uses a 2px Warm Orange bottom border.