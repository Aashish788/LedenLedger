import sharp from 'sharp';
import fs from 'fs';

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 128, name: 'favicon-128x128.png' },
  { size: 192, name: 'favicon-192x192.png' },
  { size: 512, name: 'favicon-512x512.png' },
];

async function generateFavicons() {
  const inputFile = 'src/assets/LenDenledgericon1.png';
  
  if (!fs.existsSync(inputFile)) {
    console.error('Icon file not found:', inputFile);
    return;
  }

  console.log('Generating favicons...');

  for (const { size, name } of sizes) {
    await sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(`public/${name}`);
    console.log(`✓ Generated ${name}`);
  }

  // Generate apple touch icon (180x180)
  await sharp(inputFile)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile('public/apple-touch-icon.png');
  console.log('✓ Generated apple-touch-icon.png');

  console.log('\n✓ All favicons generated successfully!');
}

generateFavicons().catch(console.error);
