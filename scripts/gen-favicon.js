const sharp = require('sharp');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const SRC = path.join(PUBLIC, 'favicon-512.png');

async function run() {
  const SIZE = 512;
  const RADIUS = 80;

  // Step 1: Read source and get raw pixels
  const srcImg = sharp(SRC).ensureAlpha();
  const { data, info } = await srcImg.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log(`Source: ${width}x${height}, channels: ${channels}`);

  // Step 2: Make near-white pixels transparent (threshold: RGB all > 240)
  const threshold = 240;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > threshold && g > threshold && b > threshold) {
      data[i + 3] = 0; // make transparent
    }
  }

  // Step 3: Create image from modified pixels and trim
  const transparentBg = await sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  const trimmed = await sharp(transparentBg).trim().png().toBuffer();
  const trimMeta = await sharp(trimmed).metadata();
  console.log(`Trimmed logo: ${trimMeta.width}x${trimMeta.height}`);

  // Step 4: Calculate padding to center the logo nicely
  // Target: logo should be about 70% of the square size
  const targetLogoSize = Math.round(SIZE * 0.70);
  const resizedLogo = await sharp(trimmed)
    .resize(targetLogoSize, targetLogoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const offsetX = Math.round((SIZE - targetLogoSize) / 2);
  const offsetY = Math.round((SIZE - targetLogoSize) / 2);

  // Step 5: Create solid white 512x512
  const whiteBg = await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  }).png().toBuffer();

  // Step 6: Composite logo centered on white background
  const withLogo = await sharp(whiteBg)
    .composite([{ input: resizedLogo, left: offsetX, top: offsetY }])
    .png()
    .toBuffer();

  // Step 7: Create rounded rect mask and clip corners
  const roundedSvg = await sharp(
    Buffer.from(
      `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="white"/>
      </svg>`
    )
  ).ensureAlpha().png().toBuffer();

  const favicon512 = await sharp(withLogo)
    .ensureAlpha()
    .composite([{ input: roundedSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Save 512
  await sharp(favicon512).toFile(path.join(PUBLIC, 'favicon-512.png'));
  console.log('Saved favicon-512.png');

  // Generate other sizes
  const sizes = [
    { name: 'favicon-192.png', size: 192 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'favicon-16.png', size: 16 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const s of sizes) {
    await sharp(favicon512)
      .resize(s.size, s.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(PUBLIC, s.name));
    console.log(`Saved ${s.name} (${s.size}x${s.size})`);
  }

  console.log('All favicons generated!');
}

run().catch(console.error);
