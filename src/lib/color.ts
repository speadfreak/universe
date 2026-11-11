/** Color utilities — WCAG contrast math for the accent-color editor. */

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio (1..21) between two hex colors. */
export function contrastRatio(a: string, b: string): number | null {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return null;
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export type AccentCheck = {
  valid: boolean;
  reason?: string;
  vsWhite: number | null; // contrast of white text on the accent (primary buttons)
  vsInk: number | null;
  aaOnWhite: boolean; // accent usable as text on porcelain
  aaButton: boolean; // white text on accent >= 4.5
};

/**
 * Validate a proposed accent color for the brand system.
 * The accent carries white text (primary CTA) and appears as small marks
 * on porcelain, so both need to clear WCAG AA where used.
 */
export function checkAccent(hex: string): AccentCheck {
  const rgb = hexToRgb(hex);
  if (!rgb) return { valid: false, reason: "Enter a hex color like #E3202B", vsWhite: null, vsInk: null, aaOnWhite: false, aaButton: false };
  const normalized = `#${hex.trim().replace(/^#/, "")}`;
  const vsWhite = contrastRatio("#FFFFFF", normalized);
  const vsInk = contrastRatio("#111012", normalized);
  // too light an accent can't carry white text and washes out next to porcelain
  const aaButton = (vsWhite ?? 0) >= 4.5;
  const tooCloseToPorcelain = (vsInk ?? 21) > 8; // nearly as light as the background
  return {
    valid: aaButton && !tooCloseToPorcelain,
    reason: !aaButton
      ? `White text on this color is ${(vsWhite ?? 0).toFixed(2)}:1 — below WCAG AA (4.5:1). Pick a deeper red.`
      : tooCloseToPorcelain
        ? "This color is too close to the porcelain background to read as the brand accent."
        : undefined,
    vsWhite,
    vsInk,
    aaOnWhite: (vsInk ?? 0) >= 4.5,
    aaButton,
  };
}

export const ACCENT_PRESETS = ["#E3202B", "#C8102E", "#A6192E", "#8C1D2F", "#B5121C"];
