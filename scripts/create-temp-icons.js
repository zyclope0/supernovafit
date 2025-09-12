const fs = require('fs');
const path = require('path');

// Créer un fichier PNG temporaire simple (1x1 pixel transparent)
const createTempIcon = (size, filename) => {
  // PNG minimal 1x1 pixel transparent
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // RGBA, no compression
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // checksum
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
    0x42, 0x60, 0x82
  ]);
  
  const filepath = path.join(__dirname, '..', 'public', 'icons', filename);
  fs.writeFileSync(filepath, pngData);
  console.log(`✅ Created ${filename} (${size}x${size})`);
};

// Créer les icônes PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Créer les icônes de shortcuts
const shortcutIcons = [
  'shortcut-dashboard.png',
  'shortcut-challenges.png',
  'shortcut-diete.png'
];

// Créer les screenshots
const screenshots = [
  'desktop-dashboard.png',
  'mobile-dashboard.png'
];

console.log('🎨 Creating temporary PWA icons...');

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Créer toutes les icônes
iconSizes.forEach(icon => {
  createTempIcon(icon.size, icon.name);
});

shortcutIcons.forEach(icon => {
  createTempIcon(96, icon);
});

screenshots.forEach(screenshot => {
  createTempIcon(128, screenshot);
});

console.log('✅ All temporary PWA icons created!');
console.log('📝 Note: These are placeholder icons. Replace with proper designs for production.');
