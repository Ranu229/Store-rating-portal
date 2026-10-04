const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running Universal Vercel Build Script...');

// Determine whether we are in root or frontend
const hasFrontendSubdir = fs.existsSync(path.join(__dirname, 'frontend', 'package.json'));
const frontendDir = hasFrontendSubdir ? path.join(__dirname, 'frontend') : __dirname;
const rootDir = hasFrontendSubdir ? __dirname : path.join(__dirname, '..');

console.log('📁 Frontend Directory:', frontendDir);
console.log('📁 Root Directory:', rootDir);

// 1. Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
execSync('npm install --include=dev', { cwd: frontendDir, stdio: 'inherit' });

// 2. Build Vite
console.log('⚡ Building Vite bundle...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

// 3. Ensure output exists in both frontend/dist and root/dist
const builtDist = path.join(frontendDir, 'dist');
const targetRootDist = path.join(rootDir, 'dist');
const targetFrontendDist = path.join(rootDir, 'frontend', 'dist');

function copyFolderSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (builtDist !== targetRootDist) {
  copyFolderSync(builtDist, targetRootDist);
}
if (builtDist !== targetFrontendDist) {
  copyFolderSync(builtDist, targetFrontendDist);
}

console.log('🎉 Universal Build Finished! Output available at dist and frontend/dist');
