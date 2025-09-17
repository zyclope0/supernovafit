#!/usr/bin/env node

/**
 * Script pour créer des icônes PNG à partir des SVG existants
 * Fallback pour la compatibilité PWA maximale
 */

const fs = require('fs');
const path = require('path');

// Tailles d'icônes requises pour PWA
const iconSizes = [72, 96, 128, 144, 152, 180, 192, 256, 384, 512];

// Template SVG base (réutilise le design existant)
const createSVG = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" rx="${size * 0.2}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" 
          font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">SF</text>
  </svg>`;

// Créer le répertoire s'il n'existe pas
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Créer les icônes SVG avec les bonnes dimensions
iconSizes.forEach(size => {
  const svgContent = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Créé: ${filename}`);
});

// Créer les screenshots
const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Screenshot desktop
const desktopScreenshot = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0f0f23"/>
    <rect x="50" y="50" width="1180" height="620" fill="url(#grad)" rx="20"/>
    <text x="640" y="360" font-family="Arial, sans-serif" font-size="48" 
          font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">SuperNovaFit</text>
    <text x="640" y="420" font-family="Arial, sans-serif" font-size="24" 
          text-anchor="middle" dominant-baseline="middle" fill="#a0a0a0">Dashboard Principal</text>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>
  </svg>`;

fs.writeFileSync(path.join(screenshotsDir, 'desktop-dashboard.svg'), desktopScreenshot);

// Screenshot mobile
const mobileScreenshot = `<svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0f0f23"/>
    <rect x="20" y="50" width="350" height="744" fill="url(#grad)" rx="20"/>
    <text x="195" y="422" font-family="Arial, sans-serif" font-size="32" 
          font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">SuperNovaFit</text>
    <text x="195" y="470" font-family="Arial, sans-serif" font-size="16" 
          text-anchor="middle" dominant-baseline="middle" fill="#a0a0a0">Version Mobile</text>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>
  </svg>`;

fs.writeFileSync(path.join(screenshotsDir, 'mobile-dashboard.svg'), mobileScreenshot);

// Créer les icônes de raccourcis
const shortcutIcons = [
  { name: 'shortcut-dashboard.svg', text: '🏠' },
  { name: 'shortcut-diete.svg', text: '🍽️' },
  { name: 'shortcut-challenges.svg', text: '🏆' }
];

shortcutIcons.forEach(({ name, text }) => {
  const shortcutSVG = `<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" rx="19.2"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" 
          text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
  
  fs.writeFileSync(path.join(iconsDir, name), shortcutSVG);
  console.log(`✅ Créé: ${name}`);
});

console.log('\n🎉 Tous les assets PWA ont été créés avec succès !');
console.log(`📁 Icônes: ${iconSizes.length} fichiers dans public/icons/`);
console.log('📸 Screenshots: 2 fichiers dans public/screenshots/');
console.log('🔗 Shortcuts: 3 icônes de raccourcis créées');
