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

// Create services directory in dist
const servicesDir = path.join(distDir, 'services');
if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}

// Copy API service
const apiServiceContent = fs.readFileSync(
  path.join(__dirname, 'src', 'services', 'apiService.js'),
  'utf8'
);
fs.writeFileSync(
  path.join(servicesDir, 'apiService.js'),
  injectEnvVariables(apiServiceContent, env)
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

// Create public directory for Vercel deployment
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy dist contents to public for web deployment
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy all dist files to public
copyRecursive(distDir, publicDir);

// Create a simple index.html for web version
const webIndexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EasyShare - File Sharing Extension</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
        }
        .hero {
            text-align: center;
            margin-bottom: 3rem;
        }
        .download-section {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 8px;
            margin: 2rem 0;
        }
        .button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 0.5rem;
        }
        .button:hover {
            background: #0056b3;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        .feature {
            padding: 1.5rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="hero">
        <h1>🚀 EasyShare</h1>
        <p>A minimalist browser extension for effortless file sharing with Supabase integration</p>
    </div>

    <div class="download-section">
        <h2>📦 Download Extension</h2>
        <p>Get the EasyShare browser extension for Chrome and other Chromium-based browsers:</p>
        <a href="./dist.zip" class="button" download>Download Extension (.zip)</a>
        <a href="https://github.com/haarmanh/easyshare" class="button">View on GitHub</a>
    </div>

    <div class="features">
        <div class="feature">
            <h3>🔒 Supabase Storage</h3>
            <p>Modern, reliable cloud storage with signed URLs for secure file sharing</p>
        </div>
        <div class="feature">
            <h3>📁 Folder Support</h3>
            <p>Automatic ZIP compression for folders with real-time progress tracking</p>
        </div>
        <div class="feature">
            <h3>⚡ Zero-friction</h3>
            <p>Drag & drop files or folders for instant upload and sharing</p>
        </div>
        <div class="feature">
            <h3>📋 Auto Clipboard</h3>
            <p>Download links are automatically copied to your clipboard</p>
        </div>
        <div class="feature">
            <h3>📊 Upload History</h3>
            <p>Keep track of all your uploaded files with built-in history</p>
        </div>
        <div class="feature">
            <h3>🔗 Platform Integration</h3>
            <p>Direct sharing to email, messaging apps, and team tools</p>
        </div>
    </div>

    <div class="download-section">
        <h2>🛠️ Installation Instructions</h2>
        <ol>
            <li>Download the extension zip file above</li>
            <li>Extract the zip file to a folder</li>
            <li>Open Chrome and go to <code>chrome://extensions/</code></li>
            <li>Enable "Developer mode" (top right)</li>
            <li>Click "Load unpacked" and select the extracted folder</li>
            <li>Configure your Supabase credentials in the extension settings</li>
        </ol>
    </div>

    <div class="download-section">
        <h2>⚙️ Configuration</h2>
        <p>You'll need a Supabase account to use this extension:</p>
        <ol>
            <li>Create a free account at <a href="https://supabase.com">supabase.com</a></li>
            <li>Create a new project</li>
            <li>Go to Storage and create a public bucket named "uploads"</li>
            <li>Copy your project URL and anon key from Settings → API</li>
            <li>Configure these in the extension settings</li>
        </ol>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), webIndexContent);

// Create a zip file of the extension for download
try {
  const archiver = require('archiver');
  const output = fs.createWriteStream(path.join(publicDir, 'dist.zip'));
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('✅ Extension zip file created: ' + archive.pointer() + ' total bytes');
  });

  archive.on('error', (err) => {
    console.log('⚠️ Could not create zip file:', err.message);
  });

  archive.pipe(output);
  archive.directory(distDir, false);
  archive.finalize();
} catch (error) {
  console.log('⚠️ Archiver not available, skipping zip creation. Run: npm install archiver');
}

console.log('✅ Build assets copied successfully!');
console.log('✅ Public directory created for Vercel deployment');
console.log('Note: Replace icon placeholders with actual PNG files for production.');
