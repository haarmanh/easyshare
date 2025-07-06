const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const env = {};

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
    console.log('✅ Environment variables loaded from .env file');
  } else {
    console.log('⚠️ No .env file found, using defaults');
  }

  return env;
}

// Inject environment variables into JavaScript files
function injectEnvVariables(content, env) {
  let injectedContent = content;

  // Replace environment variable placeholders
  for (const [key, value] of Object.entries(env)) {
    const placeholder = `process.env.${key}`;
    const quotedPlaceholder = `'${placeholder}'`;
    const doubleQuotedPlaceholder = `"${placeholder}"`;

    // Replace with proper JavaScript values
    if (value === 'true' || value === 'false') {
      injectedContent = injectedContent.replace(new RegExp(placeholder, 'g'), value);
      injectedContent = injectedContent.replace(new RegExp(quotedPlaceholder, 'g'), value);
      injectedContent = injectedContent.replace(new RegExp(doubleQuotedPlaceholder, 'g'), value);
    } else if (!isNaN(value) && value !== '') {
      injectedContent = injectedContent.replace(new RegExp(placeholder, 'g'), value);
      injectedContent = injectedContent.replace(new RegExp(quotedPlaceholder, 'g'), value);
      injectedContent = injectedContent.replace(new RegExp(doubleQuotedPlaceholder, 'g'), value);
    } else {
      injectedContent = injectedContent.replace(new RegExp(placeholder, 'g'), `'${value}'`);
      injectedContent = injectedContent.replace(new RegExp(quotedPlaceholder, 'g'), `'${value}'`);
      injectedContent = injectedContent.replace(new RegExp(doubleQuotedPlaceholder, 'g'), `'${value}'`);
    }
  }

  return injectedContent;
}

const env = loadEnvFile();

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

// Copy and process standalone JavaScript files with environment variables
const backgroundContent = fs.readFileSync(
  path.join(__dirname, 'src', 'standalone', 'background.js'),
  'utf8'
);
fs.writeFileSync(
  path.join(distDir, 'background.js'),
  injectEnvVariables(backgroundContent, env)
);

const popupContent = fs.readFileSync(
  path.join(__dirname, 'src', 'standalone', 'popup.js'),
  'utf8'
);
fs.writeFileSync(
  path.join(distDir, 'popup.js'),
  injectEnvVariables(popupContent, env)
);

// Copy platform icons
fs.copyFileSync(
  path.join(__dirname, 'src', 'icons', 'platform-icons.js'),
  path.join(iconsDir, 'platform-icons.js')
);

// Copy configuration utility
const configContent = fs.readFileSync(
  path.join(__dirname, 'src', 'utils', 'config.js'),
  'utf8'
);
fs.writeFileSync(
  path.join(distDir, 'config.js'),
  injectEnvVariables(configContent, env)
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
