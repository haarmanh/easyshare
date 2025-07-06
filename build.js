const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create icons directory in dist
const iconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create styles directory in dist
const stylesDir = path.join(distDir, 'styles');
if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir, { recursive: true });
}

// Copy manifest.json
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

// Copy popup.html
fs.copyFileSync(
  path.join(__dirname, 'popup.html'),
  path.join(distDir, 'popup.html')
);

// Copy CSS files
fs.copyFileSync(
  path.join(__dirname, 'src', 'styles', 'popup.css'),
  path.join(stylesDir, 'popup.css')
);

// Copy standalone JavaScript files
fs.copyFileSync(
  path.join(__dirname, 'src', 'standalone', 'background.js'),
  path.join(distDir, 'background.js')
);

fs.copyFileSync(
  path.join(__dirname, 'src', 'standalone', 'popup.js'),
  path.join(distDir, 'popup.js')
);

// Copy platform icons
fs.copyFileSync(
  path.join(__dirname, 'src', 'icons', 'platform-icons.js'),
  path.join(iconsDir, 'platform-icons.js')
);

// Create libs directory in dist
const libsDir = path.join(distDir, 'libs');
if (!fs.existsSync(libsDir)) {
  fs.mkdirSync(libsDir, { recursive: true });
}

// Copy Supabase library
try {
  fs.copyFileSync(
    path.join(__dirname, 'node_modules', '@supabase', 'supabase-js', 'dist', 'umd', 'supabase.js'),
    path.join(libsDir, 'supabase.js')
  );
  console.log('✅ Supabase library copied');
} catch (error) {
  console.log('⚠️ Supabase library not found, creating fallback');
  fs.writeFileSync(path.join(libsDir, 'supabase.js'), '// Supabase placeholder - install @supabase/supabase-js');
}

// Copy JSZip library
try {
  fs.copyFileSync(
    path.join(__dirname, 'node_modules', 'jszip', 'dist', 'jszip.min.js'),
    path.join(libsDir, 'jszip.min.js')
  );
  console.log('✅ JSZip library copied');
} catch (error) {
  console.log('⚠️ JSZip library not found, creating fallback');
  fs.writeFileSync(path.join(libsDir, 'jszip.min.js'), '// JSZip placeholder - install jszip');
}

// Create minimal PNG icon files (1x1 blue pixel - Chrome will scale)
const iconSizes = [16, 32, 48, 128];

// Minimal 1x1 blue PNG (base64 encoded)
const minimalBluePNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  'base64'
);

iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon${size}.png`);

  // Write the minimal PNG file
  fs.writeFileSync(iconPath, minimalBluePNG);

  // Keep placeholder for reference
  fs.writeFileSync(iconPath + '.placeholder', `${size}x${size} icon placeholder`);
});

console.log('Build assets copied successfully!');
console.log('Note: Replace icon placeholders with actual PNG files for production.');
