# Design System Specification: Editorial Precision & Tonal Depth

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Precision Curator."** 

Moving away from the cluttered, utility-first aesthetics of standard transit or meeting apps, this system treats logistical data with the elegance of a high-end fashion editorial. It leverages a rigorous 8pt grid to ensure mathematical balance while using intentional white space to provide "oxygen" to the interface. By utilizing high-contrast typography (Manrope for expression, Inter for utility) and a depth-first layout strategy, we transform a utility-heavy app into a premium, tactile experience.

The system rejects traditional "boxed-in" UI. Instead, it uses **Atmospheric Layering**—the feeling that elements are floating in a curated space, defined by light and material rather than lines and borders.

---

## 2. Colors & Surface Logic

### The "No-Line" Rule
To maintain a premium feel, **1px solid borders for sectioning are strictly prohibited.** Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   *Example:* A list of venues should not be separated by lines; instead, use `surface-container-low` for the list background and `surface-container-lowest` for the individual cards.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent materials. Use the `surface-container` tiers to guide the eye:
-   **Base Layer:** `surface` (#fdf8f8) for the main application background.
-   **Secondary Content:** `surface-container-low` (#f7f2f2) for grouping background elements.
-   **Interactive Objects:** `surface-container-lowest` (#ffffff) for cards and actionable items to create a "lifted" appearance.

### The Glass & Gradient Rule
For floating elements (overlays, navigation bars, and status pills), use **Glassmorphism**. Combine `surface` colors at 80% opacity with a `backdrop-blur` of 20px-30px. 
*   **Signature Gradient:** For primary actions, use a linear gradient from `primary` (#0058bc) to `primary-container` (#0070eb) at a 135-degree angle to provide "soul" and depth to buttons.

---

## 3. Typography
The typographic system creates an editorial hierarchy that prioritizes readability and brand authority.

*   **Display & Headlines (Manrope):** Use Manrope for all `display` and `headline` levels. Its geometric yet warm character provides the "Editorial" feel. Use `headline-lg` (2rem) for screen titles to command attention.
*   **Utility & UI (Inter):** Use Inter for all `title`, `body`, and `label` levels. Its high x-height ensures legibility in dense data contexts like map labels or participant lists.
*   **Hierarchy Strategy:** Always maintain a minimum 2-step jump in the scale between headers and body text to ensure high-contrast visual storytelling.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering** rather than structural lines.
-   **Level 0 (Base):** `surface`
-   **Level 1 (Sections):** `surface-container-low`
-   **Level 2 (Cards/Inputs):** `surface-container-lowest`
-   **Level 3 (Floating/Modals):** Glassmorphic overlays with `ambient-shadow`.

### Ambient Shadows
Avoid harsh dropshadows. Floating elements (Level 3) must use:
-   **Blur:** 24pt - 40pt.
-   **Opacity:** 4% - 6%.
-   **Color:** Use a tinted version of `on-surface` (#1c1b1b) to mimic natural light scattering.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use a **Ghost Border**: `outline-variant` at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
-   **Primary:** Gradient fill (`primary` to `primary-container`), `on-primary` text, `xl` (1.5rem) roundedness. 
-   **Secondary:** `surface-container-highest` fill with `on-surface` text. No border.
-   **Ghost:** Transparent background, `primary` text. Used for low-priority actions like "Cancel."
-   **Touch Targets:** Minimum 44x44pt for all iconic and text buttons.

### Inputs & Micro-patterns
-   **Search Bars:** Use `surface-container-low` with an `xl` corner radius. Upon focus, transition the background to `surface-container-lowest` and apply an `ambient-shadow`.
-   **Segmented Controls:** A pill-shaped `surface-container-high` track with a floating `surface-container-lowest` thumb. Use `title-sm` (Inter) for labels.

### Cards & Fairness Indicators
-   **Venue Cards:** No borders. Use `surface-container-lowest` background. 
-   **Fairness Score Cards:** Use `tertiary` (#006763) for "fair" indicators and `tertiary-container` for the background track. This teal-green signifies balance without the "stop/go" aggression of standard traffic colors.
-   **Spacing:** Use `spacing-4` (1.4rem) internal padding for cards to avoid a "cramped" feel.

### Navigation & Sheets
-   **BottomNavBar:** Glassmorphic (`surface` @ 85% + blur). Active states use the `primary` color for the icon and a 4pt dot indicator below.
-   **Draggable Sheets:** Use `xl` (1.5rem) top-only corner radius. The drag handle must be a subtle `outline-variant` pill (32x4pt) at 30% opacity.

### Live Status Pills
-   **On the Way / Arrived / Late:** Use small, high-contrast pills.
-   *Arrived:* `tertiary-fixed` background with `on-tertiary-fixed` text.
-   *Late:* `error-container` background with `on-error-container` text.

### Map Elements
-   **Custom Pins:** `primary` colored circles with a 2pt `surface-container-lowest` border. 
-   **Meetup Zones:** Use `primary` with 10% opacity for the area fill and a dashed `primary` line for the perimeter.

---

## 6. Do's and Don'ts

### Do:
-   **Do** use `spacing-6` (2rem) or `spacing-8` (2.75rem) between major content sections to maintain the editorial "breath."
-   **Do** overlap avatars in a group stack using a 2pt `surface` border to create a "cut-out" effect.
-   **Do** use `title-lg` for venue names and `body-sm` for address details to create clear typographic hierarchy.

### Don't:
-   **Don't** use 1px dividers between list items; use `spacing-3` of vertical white space instead.
-   **Don't** use pure black (#000000); always use the `on-surface` (#1C1B1B) for text to maintain tonal softness.
-   **Don't** place text directly on images; use a `surface-container-highest` scrim (gradient overlay) at the bottom 30% of the image for legibility.
-   **Don't** exceed `roundedness-xl` for large containers; maintain a consistent radius language across the app.