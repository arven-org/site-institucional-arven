/**
 * Tokens espelhados da página Design Tokens (arvenoficial.com/templates).
 */
export const ARVEN_TOKEN_SECTIONS = [
  {
    title: "Brand (Primitivas)",
    id: "brand",
    items: [
      { name: "--arven-dark", value: "#eaefef", kind: "color" },
      { name: "--arven-blue", value: "#7f8caa", kind: "color" },
      { name: "--arven-ice", value: "#333446", kind: "color" },
      { name: "--arven-light", value: "#16161f", kind: "color" },
    ],
  },
  {
    title: "Base",
    id: "base",
    items: [
      { name: "--background", value: "#16161f", kind: "color" },
      { name: "--foreground", value: "#eaefef", kind: "color" },
    ],
  },
  {
    title: "Card",
    id: "card",
    items: [
      { name: "--card", value: "#1a1a24", kind: "color" },
      { name: "--card-foreground", value: "#eaefef", kind: "color" },
      { name: "--card-border", value: "#7f8caa33", kind: "color" },
    ],
  },
  {
    title: "Popover",
    id: "popover",
    items: [
      { name: "--popover", value: "#1a1a24", kind: "color" },
      { name: "--popover-foreground", value: "#eaefef", kind: "color" },
      { name: "--popover-border", value: "#7f8caa33", kind: "color" },
    ],
  },
  {
    title: "Primary",
    id: "primary",
    items: [
      { name: "--primary", value: "#eaefef", kind: "color" },
      { name: "--primary-foreground", value: "#16161f", kind: "color" },
      { name: "--primary-hover", value: "#f5f5f5", kind: "color" },
    ],
  },
  {
    title: "Secondary",
    id: "secondary",
    items: [
      { name: "--secondary", value: "#333446", kind: "color" },
      { name: "--secondary-foreground", value: "#eaefef", kind: "color" },
      { name: "--secondary-hover", value: "#3d3e52", kind: "color" },
    ],
  },
  {
    title: "Muted",
    id: "muted",
    items: [
      { name: "--muted", value: "#333446", kind: "color" },
      { name: "--muted-foreground", value: "#7f8caa", kind: "color" },
      { name: "--muted-border", value: "#7f8caa4d", kind: "color" },
    ],
  },
  {
    title: "Accent",
    id: "accent",
    items: [
      { name: "--accent", value: "#7f8caa", kind: "color" },
      { name: "--accent-foreground", value: "#eaefef", kind: "color" },
      { name: "--accent-hover", value: "#8b9ab8", kind: "color" },
    ],
  },
  {
    title: "Border & Input",
    id: "border-input",
    items: [
      { name: "--border", value: "#7f8caa33", kind: "color" },
      { name: "--input", value: "#333446", kind: "color" },
      { name: "--input-border", value: "#7f8caa4d", kind: "color" },
      { name: "--input-focus", value: "#7f8caa", kind: "color" },
      { name: "--ring", value: "#7f8caa", kind: "color" },
    ],
  },
  {
    title: "Destructive",
    id: "destructive",
    items: [
      { name: "--destructive", value: "lab(28.5139% 44.5539 29.0463)", kind: "color" },
      { name: "--destructive-foreground", value: "lab(55.4814% 75.0732 48.8528)", kind: "color" },
      { name: "--destructive-hover", value: "lab(23.0561% 47.6445 32.8708)", kind: "color" },
    ],
  },
  {
    title: "Success",
    id: "success",
    items: [
      { name: "--success", value: "142.1 70.6% 45.3%", kind: "hsl-space", display: "142.1 70.6% 45.3%" },
      { name: "--success-foreground", value: "0 0% 100%", kind: "hsl-space", display: "0 0% 100%" },
    ],
  },
  {
    title: "Charts",
    id: "charts",
    items: [
      { name: "--chart-1", value: "#eaefef", kind: "color" },
      { name: "--chart-2", value: "#7f8caa", kind: "color" },
      { name: "--chart-3", value: "#333446", kind: "color" },
      { name: "--chart-4", value: "#1a1a24", kind: "color" },
      { name: "--chart-5", value: "#5a5d75", kind: "color" },
    ],
  },
  {
    title: "Radius",
    id: "radius",
    items: [{ name: "--radius", value: ".625rem", kind: "raw" }],
  },
  {
    title: "Navigation",
    id: "navigation",
    items: [
      { name: "--nav-bg", value: "#101018f2", kind: "color" },
      { name: "--nav-bg-scrolled", value: "#12121cfa", kind: "color" },
      { name: "--nav-bg-mobile", value: "#10101880", kind: "color" },
      { name: "--nav-bg-scrolled-mobile", value: "#12121c99", kind: "color" },
      { name: "--nav-bg-tag", value: "#12121c99", kind: "color" },
      { name: "--nav-border", value: "#7f8caa33", kind: "color" },
      { name: "--nav-text", value: "#eaefef", kind: "color" },
      { name: "--nav-text-muted", value: "#7f8caa", kind: "color" },
      { name: "--nav-text-hover", value: "#7f8caa", kind: "color" },
      { name: "--nav-logo", value: '"/images/logo-dark.png"', kind: "raw" },
    ],
  },
  {
    title: "Hero",
    id: "hero",
    items: [
      { name: "--hero-bg", value: "transparent", kind: "special" },
      { name: "--hero-text", value: "#eaefef", kind: "color" },
      { name: "--hero-text-muted", value: "#7f8caa", kind: "color" },
    ],
  },
  {
    title: "Section",
    id: "section",
    items: [
      { name: "--section-bg", value: "transparent", kind: "special" },
      { name: "--section-fg", value: "#eaefef", kind: "color" },
      { name: "--section-fg-muted", value: "#7f8caa", kind: "color" },
      { name: "--section-border", value: "#7f8caa4d", kind: "color" },
      { name: "--section-card-bg", value: "#1a1a24", kind: "color" },
      { name: "--section-card-contact-bg", value: "#0a0a12d9", kind: "color" },
    ],
  },
  {
    title: "Button",
    id: "button",
    items: [
      { name: "--button-primary-bg", value: "#eaefef", kind: "color" },
      { name: "--button-primary-text", value: "#16161f", kind: "color" },
      { name: "--button-primary-hover", value: "#dce1e1e6", kind: "color" },
      { name: "--button-outline-border", value: "#eaefef", kind: "color" },
      { name: "--button-outline-text", value: "#eaefef", kind: "color" },
      { name: "--button-outline-hover-border", value: "#7f8caa", kind: "color" },
    ],
  },
  {
    title: "Footer",
    id: "footer-tokens",
    items: [
      { name: "--footer-bg", value: "transparent", kind: "special" },
      { name: "--footer-text", value: "#eaefef", kind: "color" },
      { name: "--footer-text-muted", value: "#7f8caa", kind: "color" },
      { name: "--footer-border", value: "#7f8caa4d", kind: "color" },
    ],
  },
  {
    title: "Neural / Fluid",
    id: "neural-fluid",
    items: [
      { name: "--neural-bg-base", value: "#0a0a12", kind: "color" },
      { name: "--neural-color-primary", value: "#1a1a2e", kind: "color" },
      { name: "--neural-color-accent", value: "#16213e", kind: "color" },
      { name: "--neural-intensity", value: ".3", kind: "raw" },
      { name: "--dithering-color", value: "#5a7fb8", kind: "color" },
      { name: "--fluid-bg-solid", value: "#0a0a12", kind: "color" },
      { name: "--fluid-gradient-start", value: "#16161f", kind: "color" },
      { name: "--fluid-gradient-end", value: "#16161f", kind: "color" },
      { name: "--fluid-blob-primary", value: "#3334464d", kind: "color" },
      { name: "--fluid-blob-secondary", value: "#16161f80", kind: "color" },
      { name: "--fluid-blob-tertiary", value: "#16161f00", kind: "color" },
    ],
  },
  {
    title: "Toast",
    id: "toast",
    items: [
      { name: "--toast-bg", value: "#1a1a24", kind: "color" },
      { name: "--toast-border", value: "#7f8caa4d", kind: "color" },
      { name: "--toast-text", value: "#eaefef", kind: "color" },
      { name: "--toast-text-muted", value: "#7f8caa", kind: "color" },
    ],
  },
  {
    title: "Sidebar",
    id: "sidebar-tokens",
    items: [
      { name: "--sidebar", value: "#1a1a24", kind: "color" },
      { name: "--sidebar-foreground", value: "#eaefef", kind: "color" },
      { name: "--sidebar-primary", value: "#7f8caa", kind: "color" },
      { name: "--sidebar-primary-foreground", value: "#eaefef", kind: "color" },
      { name: "--sidebar-accent", value: "#333446", kind: "color" },
      { name: "--sidebar-accent-foreground", value: "#eaefef", kind: "color" },
      { name: "--sidebar-border", value: "#7f8caa33", kind: "color" },
      { name: "--sidebar-ring", value: "#7f8caa", kind: "color" },
    ],
  },
];
