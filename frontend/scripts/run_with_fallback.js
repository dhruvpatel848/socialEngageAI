/**
 * Script to run Next.js development server with fallback options
 * This helps handle permission issues and other common errors
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure .next directory exists and is writable
const nextDir = path.join(__dirname, '..', '.next');
if (!fs.existsSync(nextDir)) {
  try {
    fs.mkdirSync(nextDir, { recursive: true });
    console.log(`Created .next directory at ${nextDir}`);
  } catch (err) {
    console.warn(`Warning: Could not create .next directory: ${err.message}`);
  }
}

// Ensure trace directory exists and is writable
const traceDir = path.join(nextDir, 'trace');
if (!fs.existsSync(traceDir)) {
  try {
    fs.mkdirSync(traceDir, { recursive: true });
    console.log(`Created trace directory at ${traceDir}`);
  } catch (err) {
    console.warn(`Warning: Could not create trace directory: ${err.message}`);
  }
}

// Set environment variable to disable tracing if we can't write to trace directory
try {
  const testFile = path.join(traceDir, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('Trace directory is writable');
} catch (err) {
  console.warn(`Warning: Trace directory is not writable: ${err.message}`);
  console.log('Disabling Next.js tracing');
  process.env.NEXT_DISABLE_TRACES = '1';
}

// Start Next.js dev server
console.log('Starting Next.js development server...');

// Use the full path to npx or use the local next command directly
let command = 'npx';
let args = ['next', 'dev'];

// On Windows, try to use the local next command from node_modules
if (process.platform === 'win32') {
  const localNextBin = path.join(__dirname, '..', 'node_modules', '.bin', 'next.cmd');
  if (fs.existsSync(localNextBin)) {
    console.log(`Using local Next.js binary: ${localNextBin}`);
    command = localNextBin;
    args = ['dev'];
  }
}

const nextDev = spawn(command, args, {
  stdio: 'inherit',
  env: { ...process.env },
  shell: true // Use shell on Windows
});

nextDev.on('error', (err) => {
  console.error(`Failed to start Next.js dev server: ${err.message}`);
  process.exit(1);
});

nextDev.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Next.js dev server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Shutting down Next.js dev server...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down Next.js dev server...');
  nextDev.kill('SIGTERM');
});