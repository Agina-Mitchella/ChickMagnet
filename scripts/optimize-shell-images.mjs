import { mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicImages = path.join(root, 'public', 'images');
const navigationImages = path.join(publicImages, 'navigation');

await mkdir(navigationImages, { recursive: true });

const navigationSources = [
  ['all-products', 'src/assets/images/hero_poultry_chicks_1785408878635.jpg', 'south'],
  ['live-chicken', 'src/assets/images/live_rooster_hen_1785409332530.jpg', 'centre'],
  ['fresh-chicken', 'src/assets/images/category-fresh-chicken.jpg', 'centre'],
  ['eggs', 'src/assets/images/category-eggs.jpg', 'centre'],
];

for (const [name, source, position] of navigationSources) {
  await sharp(path.join(root, source))
    .resize(96, 96, { fit: 'cover', position })
    .webp({ quality: 78, effort: 6 })
    .toFile(path.join(navigationImages, `${name}.webp`));
}

await sharp(path.join(root, 'src/assets/images/regenerated_image_1787820822648.png'))
  .resize({ width: 240, height: 108, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 86, alphaQuality: 100, effort: 6 })
  .toFile(path.join(publicImages, 'chickmagnet-logo.webp'));

const faviconPath = path.join(root, 'public', 'chickmagnet-favicon.png');
const optimizedFaviconPath = path.join(root, 'public', 'chickmagnet-favicon.optimized.png');
await sharp(faviconPath)
  .resize(256, 256, { fit: 'contain' })
  .png({ compressionLevel: 9, palette: true, quality: 100 })
  .toFile(optimizedFaviconPath);
await rename(optimizedFaviconPath, faviconPath);

await sharp(path.join(publicImages, 'hero-commercial-farm-mobile.jpg'))
  .resize(480, 657, { fit: 'cover', position: 'centre' })
  .avif({ quality: 56, effort: 6 })
  .toFile(path.join(publicImages, 'hero-commercial-farm-mobile.avif'));

await sharp(path.join(publicImages, 'hero-commercial-farm-mobile.jpg'))
  .resize(480, 657, { fit: 'cover', position: 'centre' })
  .webp({ quality: 78, effort: 6 })
  .toFile(path.join(publicImages, 'hero-commercial-farm-mobile.webp'));

await sharp(path.join(publicImages, 'hero-commercial-farm-desktop.jpg'))
  .resize(1600, 640, { fit: 'cover', position: 'centre', withoutEnlargement: true })
  .avif({ quality: 64, effort: 6 })
  .toFile(path.join(publicImages, 'hero-commercial-farm-desktop.avif'));

await sharp(path.join(publicImages, 'hero-commercial-farm-desktop.jpg'))
  .resize(1600, 640, { fit: 'cover', position: 'centre', withoutEnlargement: true })
  .webp({ quality: 78, effort: 6 })
  .toFile(path.join(publicImages, 'hero-commercial-farm-desktop.webp'));
