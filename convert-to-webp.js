#!/usr/bin/env node

/**
 * Convert images to WebP format
 * Run with: node convert-to-webp.js
 * 
 * Prerequisites: Install sharp
 * npm install --save-dev sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imageDir = path.join(__dirname, 'public/images');

const convertToWebP = async (filePath) => {
  try {
    const fileName = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath).toLowerCase();
    
    // Skip already webp or non-image files
    if (ext === '.webp' || ext === '.svg') return;
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

    const outputPath = path.join(path.dirname(filePath), `${fileName}.webp`);

    // Skip if webp already exists
    if (fs.existsSync(outputPath)) return;

    const webpSize = await sharp(filePath)
      .webp({ quality: 75 })
      .toFile(outputPath);

    const originalSize = fs.statSync(filePath).size;
    const newSize = webpSize.size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);

    console.log(`✓ ${fileName}.webp: ${(originalSize / 1024).toFixed(2)}KB → ${(newSize / 1024).toFixed(2)}KB (${reduction}% reduction)`);
  } catch (error) {
    console.error(`✗ Error converting ${filePath}:`, error.message);
  }
};

const processDirectory = async (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (stat.isFile()) {
      await convertToWebP(filePath);
    }
  }
};

console.log('🖼️  Starting WebP conversion...');
processDirectory(imageDir)
  .then(() => console.log('✅ WebP conversion complete!'))
  .catch(err => console.error('❌ Conversion failed:', err));
