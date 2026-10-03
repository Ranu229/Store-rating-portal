const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('==================================================');
console.log('🚀 Starting Store Rating Portal (FullStack Dev)...');
console.log('==================================================\n');

// 1. Launch Backend
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (err) => {
  console.error('Backend process error:', err);
});

// 2. Launch Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

frontend.on('error', (err) => {
  console.error('Frontend process error:', err);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
