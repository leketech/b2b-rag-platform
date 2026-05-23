import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-secondary": "#00363a",
        "primary-fixed-dim": "#b7c8de",
        "primary-container": "#1a2b3c",
        "background": "#0b1326",
        "on-error-container": "#ffdad6",
        "secondary-container": "#00f1fe",
        "surface-dim": "#0b1326",
        "surface-container-low": "#131b2e",
        "surface-glow": "rgba(0, 242, 255, 0.15)",
        "on-primary-fixed-variant": "#38485a",
        "outline": "#8e9197",
        "error-container": "#93000a",
        "on-secondary-fixed": "#002022",
        "secondary": "#ddfcff",
        "inverse-primary": "#4f6073",
        "on-tertiary-fixed-variant": "#5700c9",
        "surface-tint": "#b7c8de",
        "on-primary-container": "#8192a7",
        "on-tertiary-container": "#a178ff",
        "on-surface": "#dae2fd",
        "primary-fixed": "#d2e4fb",
        "tertiary-fixed-dim": "#d1bcff",
        "surface-container-high": "#222a3d",
        "on-secondary-fixed-variant": "#004f54",
        "primary": "#b7c8de",
        "on-tertiary-fixed": "#23005b",
        "surface-container-highest": "#2d3449",
        "deep-navy": "#0a121e",
        "surface-bright": "#31394d",
        "tertiary": "#d1bcff",
        "on-error": "#690005",
        "tertiary-fixed": "#e9ddff",
        "surface-container": "#171f33",
        "surface": "#0b1326",
        "inverse-on-surface": "#283044",
        "on-surface-variant": "#c4c6cd",
        "secondary-fixed-dim": "#00dbe7",
        "glass-stroke": "rgba(255, 255, 255, 0.08)",
        "outline-variant": "#44474c",
        "on-secondary-container": "#006a70",
        "surface-container-lowest": "#060e20",
        "error": "#ffb4ab",
        "inverse-surface": "#dae2fd",
        "on-background": "#dae2fd",
        "on-primary-fixed": "#0b1d2d",
        "on-tertiary": "#3c0090",
        "on-primary": "#213243",
        "tertiary-container": "#34007f",
        "surface-variant": "#2d3449",
        "secondary-fixed": "#74f5ff",
        // preserve existing
        "border": "#e4e4e7",
        "ink": "#18181b",
        "muted": "#71717a",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "unit": "8px",
        "section-padding": "80px",
        "gutter": "24px",
        "container-max": "1280px"
      },
      fontFamily: {
        "body-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "display-lg-mobile": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"]
      },
      fontSize: {
        "body-lg": ["18px", {"lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400"}],
        "headline-md": ["32px", {"lineHeight": "1.3", "letterSpacing": "-0.02em", "fontWeight": "500"}],
        "display-lg": ["64px", {"lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "600"}],
        "body-md": ["16px", {"lineHeight": "1.5", "letterSpacing": "0.01em", "fontWeight": "400"}],
        "display-lg-mobile": ["40px", {"lineHeight": "1.2", "letterSpacing": "-0.03em", "fontWeight": "600"}],
        "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.1em", "fontWeight": "700"}]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
