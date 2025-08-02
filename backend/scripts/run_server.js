#!/usr/bin/env node

/**
 * EngageAI Backend Server
 * 
 * This script starts the Express server for the backend service.
 * 
 * Usage:
 *   node run_server.js [--port PORT]
 */

require('dotenv').config();
const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Parse command line arguments
program
  .option('-p, --port <port>', 'Port to run the server on', process.env.PORT || 5000)
  .option('-e, --env <env>', 'Environment to run in', process.env.NODE_ENV || 'development')
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
process.env.NODE_ENV = options.env;

console.log(`Starting EngageAI backend server in ${options.env} mode on port ${options.port}`);

// Start the server
const serverProcess = spawn('node', ['src/index.js'], {
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