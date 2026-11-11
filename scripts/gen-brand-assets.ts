/* Generates brand assets (apple-icon, OG image) from the logo using sharp. */
import sharp from "sharp";
import { mkdirSync } from "fs";
import path from "path";

const root = process.cwd();

async function appleIcon() {
  const logo = await sharp(path.join(root, "public/logo.png"))
    .resize(172, 172, { fit: "contain", background: { r: 5, g: 7, b: 13, alpha: 0 } })
    .png()
    .toBuffer();
  const svg = Buffer.from(
    `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0D1F3C"/><stop offset="1" stop-color="#05070D"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.4" r="0.65">
          <stop offset="0" stop-color="#2F6BFF" stop-opacity="0.4"/><stop offset="1" stop-color="#2F6BFF" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="180" height="180" fill="url(#bg)"/>
      <rect width="180" height="180" fill="url(#glow)"/>
    </svg>`
  );
  await sharp(svg)
    .composite([{ input: logo, top: 4, left: 4 }])
    .png()
    .toFile(path.join(root, "src/app/apple-icon.png"));
  console.log("✓ apple-icon.png");
}

async function ogImage() {
  const logo = await sharp(path.join(root, "public/logo.png"))
    .resize(430, 430, { fit: "contain", background: { r: 5, g: 7, b: 13, alpha: 0 } })
    .png()
    .toBuffer();
  const svg = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0A1628"/><stop offset="1" stop-color="#05070D"/>
        </linearGradient>
        <radialGradient id="g1" cx="0.15" cy="0.05" r="0.7">
          <stop offset="0" stop-color="#2F6BFF" stop-opacity="0.32"/><stop offset="1" stop-color="#2F6BFF" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g2" cx="0.95" cy="0.9" r="0.6">
          <stop offset="0" stop-color="#38D6FF" stop-opacity="0.22"/><stop offset="1" stop-color="#38D6FF" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect width="1200" height="630" fill="url(#g1)"/>
      <rect width="1200" height="630" fill="url(#g2)"/>
      <line x1="0" y1="629.5" x2="1200" y2="629.5" stroke="#2F6BFF" stroke-opacity="0.6" stroke-width="3"/>
      <path d="M60 500 h180 l16-26 22 52 18-42 12 16 h130" fill="none" stroke="#38D6FF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
      <text x="640" y="300" font-family="DejaVu Sans, Arial, sans-serif" font-size="64" font-weight="bold" fill="#FFFFFF">Universe Medical Center</text>
      <text x="640" y="372" font-family="DejaVu Sans, Arial, sans-serif" font-size="38" fill="#38D6FF">Better Care for Better Health</text>
      <text x="640" y="448" font-family="DejaVu Sans, Arial, sans-serif" font-size="26" fill="#9DB4D6">Internal Medicine · Addis Ababa &amp; Ambo · 0116390354</text>
    </svg>`
  );
  await sharp(svg)
    .composite([{ input: logo, top: 100, left: 130 }])
    .png()
    .toFile(path.join(root, "public/og-image.png"));
  console.log("✓ public/og-image.png");
}

async function faviconPng() {
  await sharp(path.join(root, "src/app/icon.svg"))
    .resize(48, 48)
    .png()
    .toFile(path.join(root, "public/favicon-48.png"));
  console.log("✓ public/favicon-48.png");
}

(async () => {
  mkdirSync(path.join(root, "content"), { recursive: true });
  await appleIcon();
  await ogImage();
  await faviconPng();
})();
