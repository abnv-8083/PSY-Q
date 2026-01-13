#!/usr/bin/env node

/**
 * Image compression script
 * Run with: node compress-images.js
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

const compressImage = async (filePath) => {
  try {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Skip already compressed or non-image files
    if (['.svg', '.webp'].includes(ext)) return;

    let pipeline = sharp(filePath);

    // Different compression settings based on file type
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 70, progressive: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, quality: 80 });
    }

    const outputPath = filePath;
    await pipeline.toFile(`${outputPath}.tmp`);
    
    const originalSize = fs.statSync(filePath).size;
    const newSize = fs.statSync(`${outputPath}.tmp`).size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);

    fs.renameSync(`${outputPath}.tmp`, outputPath);
    console.log(`✓ ${fileName}: ${(originalSize / 1024).toFixed(2)}KB → ${(newSize / 1024).toFixed(2)}KB (${reduction}% reduction)`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
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
      await compressImage(filePath);
    }
  }
};

console.log('🖼️  Starting image compression...');
processDirectory(imageDir)
  .then(() => console.log('✅ Image compression complete!'))
  .catch(err => console.error('❌ Compression failed:', err));
