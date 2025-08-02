#!/usr/bin/env node

/**
 * EngageAI Frontend Development Server
 * 
 * This script starts the Next.js development server for the frontend.
 * 
 * Usage:
 *   node run_dev.js [--port PORT]
 */

require('dotenv').config();
const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Parse command line arguments
program
  .option('-p, --port <port>', 'Port to run the server on', process.env.PORT || 3000)
  .option('-h, --host <host>', 'Host to run the server on', process.env.HOST || 'localhost')
  .parse(process.argv);

const options = program.opts();

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file streams
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Set environment variables
process.env.PORT = options.port;
process.env.HOST = options.host;

console.log(`Starting EngageAI frontend development server on ${options.host}:${options.port}`);

// Start the Next.js development server
const serverProcess = spawn('npx', ['next', 'dev', '-p', options.port, '-H', options.host], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: process.env
});

// Pipe stdout and stderr to console and log files
serverProcess.stdout.pipe(process.stdout);
serverProcess.stderr.pipe(process.stderr);
serverProcess.stdout.pipe(accessLogStream);
serverProcess.stderr.pipe(errorLogStream);

// Handle server process events
serverProcess.on('error', (error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code} and signal ${signal}`);
    process.exit(code);
  }
});

// Handle process signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error.message}`);
  serverProcess.kill('SIGTERM');
  process.exit(1);
});