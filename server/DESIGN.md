# DESIGN.md: Cobalt Admin

The server-rendered admin interface uses the Cobalt design system. These are
the canonical tokens for its colors, typography, spacing, radii, shadows, and
motion. Use tokens rather than introducing literal values in admin views.

## Tokens

```css
:root {
  --color-paper: oklch(98.6% 0.005 250);
  --color-paper-2: oklch(96.2% 0.008 252);
  --color-paper-3: oklch(93% 0.011 252);
  --color-ink: oklch(21% 0.028 262);
  --color-ink-2: oklch(36% 0.022 260);
  --color-muted: oklch(50% 0.018 258);
  --color-rule: oklch(90% 0.009 252);
  --color-rule-2: oklch(83% 0.012 252);
  --color-graphite: oklch(21% 0.024 262);
  --color-graphite-2: oklch(26.5% 0.026 262);
  --color-graphite-ink: oklch(93% 0.01 250);
  --color-graphite-muted: oklch(69% 0.022 256);
  --color-accent: oklch(52% 0.19 258);
  --color-accent-2: oklch(76% 0.13 254);
  --color-accent-wash: oklch(95% 0.028 256);
  --color-accent-ink: oklch(98.6% 0.005 250);
  --color-accent-deep: oklch(43% 0.2 262);
  --color-accent-edge: oklch(39% 0.16 260);
  --color-glyph-1: oklch(89% 0.025 254);
  --color-glyph-2: oklch(81% 0.045 255);
  --color-glyph-3: oklch(70% 0.085 256);
  --color-glyph-4: oklch(60% 0.13 257);
  --color-graphite-glyph-1: oklch(33% 0.03 262);
  --color-graphite-glyph-2: oklch(41% 0.05 260);
  --color-graphite-glyph-3: oklch(53% 0.1 258);
  --color-key-face: oklch(99.4% 0.003 250);
  --color-key-edge: oklch(80% 0.016 254);
  --color-focus: oklch(52% 0.19 258);
  --color-danger: oklch(58% 0.2 25);
  --color-success: oklch(58% 0.16 150);
  --color-warning: oklch(72% 0.16 80);
  --color-shadow-soft: oklch(21% 0.028 262 / 0.06);
  --color-shadow: oklch(21% 0.028 262 / 0.28);
  --color-shadow-accent: oklch(30% 0.12 260 / 0.45);
  --color-shadow-press: oklch(21% 0.028 262 / 0.14);
  --color-highlight: oklch(100% 0 0 / 0.9);
  --color-highlight-muted: oklch(100% 0 0 / 0.22);
  --color-dark-paper: oklch(18% 0.02 262);
  --color-dark-paper-2: oklch(22% 0.022 262);
  --color-dark-paper-3: oklch(27% 0.024 262);
  --color-dark-ink: oklch(93% 0.01 250);
  --color-dark-ink-2: oklch(78% 0.014 254);
  --color-dark-muted: oklch(62% 0.016 256);
  --color-dark-rule: oklch(30% 0.02 262);
  --color-dark-rule-2: oklch(36% 0.022 262);
  --color-dark-key-face: oklch(26% 0.024 262);
  --color-dark-key-edge: oklch(16% 0.02 262);
  --color-dark-accent-wash: oklch(28% 0.06 258);
  --font-display: "Familjen Grotesk", system-ui, sans-serif;
  --font-body: "IBM Plex Sans", system-ui, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;
  --radius-card: 8px;
  --radius-input: 6px;
  --radius-pill: 999px;
  --cut: 8px;
  --cut-l: 16px;
  --rule-hair: 1px;
  --dur-micro: 120ms;
  --dur-short: 200ms;
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```
