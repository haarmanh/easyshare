const fs = require('fs');
const path = require('path');

// Simple PNG creation function
function createPNG(width, height, color = [59, 130, 246]) {
  // PNG file header
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdr = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // length
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.from([ihdrCrc >> 24, (ihdrCrc >> 16) & 0xFF, (ihdrCrc >> 8) & 0xFF, ihdrCrc & 0xFF])
  ]);
  
  // Create simple image data (solid color)
  const bytesPerPixel = 3;
  const rowSize = width * bytesPerPixel + 1; // +1 for filter byte
  const imageData = Buffer.alloc(height * rowSize);
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    imageData[rowStart] = 0; // filter type (None)
    
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * bytesPerPixel;
      imageData[pixelStart] = color[0];     // R
      imageData[pixelStart + 1] = color[1]; // G
      imageData[pixelStart + 2] = color[2]; // B
    }
  }
  
  // Compress image data (simplified - just add zlib header/footer)
  const compressed = Buffer.concat([
    Buffer.from([0x78, 0x9C]), // zlib header
    imageData,
    Buffer.from([0x00, 0x00, 0x00, 0x00]) // simplified checksum
  ]);
  
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  const idat = Buffer.concat([
    Buffer.from([(compressed.length >> 24) & 0xFF, (compressed.length >> 16) & 0xFF, (compressed.length >> 8) & 0xFF, compressed.length & 0xFF]),
    Buffer.from('IDAT'),
    compressed,
    Buffer.from([idatCrc >> 24, (idatCrc >> 16) & 0xFF, (idatCrc >> 8) & 0xFF, idatCrc & 0xFF])
  ]);
  
  // IEND chunk
  const iendCrc = crc32(Buffer.from('IEND'));
  const iend = Buffer.concat([
    Buffer.from([0, 0, 0, 0]), // length
    Buffer.from('IEND'),
    Buffer.from([iendCrc >> 24, (iendCrc >> 16) & 0xFF, (iendCrc >> 8) & 0xFF, iendCrc & 0xFF])
  ]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Simple CRC32 implementation
function crc32(data) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Create icons directory
const iconsDir = path.join(__dirname, 'dist', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create icon files
const sizes = [16, 32, 48, 128];
const blueColor = [59, 130, 246]; // Nice blue color

sizes.forEach(size => {
  const pngData = createPNG(size, size, blueColor);
  const iconPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(iconPath, pngData);
  console.log(`Created ${iconPath}`);
});

console.log('All icon files created successfully!');
