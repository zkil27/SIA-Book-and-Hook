---
version: "alpha"
name: "Aura - Intelligent Hub"
description: "Aura Intelligent Login Section is designed for authenticating users through a focused access flow. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for authentication screens in web products."
colors:
  primary: "#34A6BD"
  secondary: "#F43F5E"
  tertiary: "#F59E0B"
  neutral: "#000000"
  background: "#FFFFFF"
  surface: "#34A6BD"
  text-primary: "#374151"
  text-secondary: "#111827"
  border: "#FFFFFF"
  accent: "#34A6BD"
  brand-blue: "#34A6BD"
  brand-cyan: "#58C6DB"
  brand-deep: "#1C6E80"
  brand-ink: "#103A45"
typography:
  display-lg:
    fontFamily: "Geist"
    fontSize: "120px"
    fontWeight: 300
    lineHeight: "120px"
    letterSpacing: "-0.05em"
  body-md:
    fontFamily: "Geist"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label-md:
    fontFamily: "System Font"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
rounded:
  md: "4px"
spacing:
  base: "4px"
  sm: "2px"
  md: "4px"
  lg: "6px"
  xl: "8px"
  gap: "4px"
  card-padding: "12px"
  section-padding: "40px"
components:
  button-primary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.background}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "0px"
  button-link:
    textColor: "{colors.text-primary}"
    rounded: "0px"
    padding: "0px"
  card:
    backgroundColor: "#F7F7F5"
    rounded: "0px"
    padding: "12px"
---

## Overview

- **Composition cues:**
  - Layout: Flex
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Minimal

## Colors

The color system uses light mode with #34A6BD (our signature brand blue / teal) as the main accent and #000000 as the neutral foundation.

- **Primary (#34A6BD):** Main accent and signature blue emphasis color.
- **Secondary (#F43F5E):** Supporting accent for secondary emphasis.
- **Tertiary (#F59E0B):** Reserved accent for supporting contrast moments.
- **Neutral (#000000):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #FFFFFF; Surface: #34A6BD; Text Primary: #374151; Text Secondary: #111827; Border: #FFFFFF; Accent: #34A6BD

## Typography

Typography pairs Geist for display hierarchy with System Font for supporting content and interface copy.

- **Display (`display-lg`):** Geist, 120px, weight 300, line-height 120px, letter-spacing -0.05em.
- **Body (`body-md`):** Geist, 14px, weight 400, line-height 20px.
- **Labels (`label-md`):** System Font, 16px, weight 400, line-height 24px.

## Layout

Layout follows a flex composition with reusable spacing tokens. Preserve the flex, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a flex / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Flex
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 2px, 4px, 6px, 8px, 12px, 16px, 24px, 32px
- **Section padding:** 40px, 48px
- **Card padding:** 12px, 48px
- **Gaps:** 4px, 8px, 12px, 16px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 3px #FFFFFF; 1px #E5E7EB; 1px #F3F4F6; 3px #000000
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 30px 60px -15px
- **Blur:** 12px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 8px padding and a 0px radius. Drive the shell with none so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 2px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 2px, 4px, 6px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** background #000000, text #FFFFFF, radius 4px, padding 0px, border 0px solid rgb(229, 231, 235).
- **Links:** text #374151, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** background #F7F7F5, radius 0px, padding 12px, shadow none.
- **Card surface:** background #FFFFFF, border 0px solid rgb(229, 231, 235), radius 0px, padding 48px, shadow none.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette (#34A6BD signature blue) as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 2px, 4px, 6px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected expressive motion intensity without a deliberate reason.

## Motion

Motion feels expressive but remains focused on interface, text, and layout transitions. Timing clusters around 150ms and 2000ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on color and text changes.

**Motion Level:** expressive

**Durations:** 150ms, 2000ms, 500ms, 1000ms, 300ms

**Easings:** ease, cubic-bezier(0.4, 0, 1), 0.2, 0.6

**Hover Patterns:** color, text, transform, shadow, grayscale

## WebGL

Reconstruct the graphics as a full-bleed background field using webgl, custom shaders. The effect should read as technical, meditative, and atmospheric: dot-matrix particle field with white and sparse spacing. Build it from dot particles + soft depth fade so the effect reads clearly. Animate it as slow breathing pulse. Interaction can react to the pointer, but only as a subtle drift. Preserve dom fallback.

**Id:** webgl

**Label:** WebGL

**Stack:** WebGL

**Insights:**
  - **Scene:**
    - **Value:** Full-bleed background field
  - **Effect:**
    - **Value:** Dot-matrix particle field
  - **Primitives:**
    - **Value:** Dot particles + soft depth fade
  - **Motion:**
    - **Value:** Slow breathing pulse
  - **Interaction:**
    - **Value:** Pointer-reactive drift
  - **Render:**
    - **Value:** WebGL, custom shaders

**Techniques:** Dot matrix, Breathing pulse, Pointer parallax, Shader gradients, Noise fields

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <!-- WebGL Background -->
      <canvas id="webgl-canvas" class="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.25]"></canvas>

      <!-- Header -->
      ```
