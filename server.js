// Glitch.com deployment entry point
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function buildAndStart() {
  console.log('🚀 Starting Secure Professional Bank...');
  
  // Check if build exists, if not, build it
  const distPath = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('📦 Building application...');
    try {
      await execAsync('npm run build');
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }
  
  // Start the server
  console.log('🌟 Starting server...');
  const { default: app } = await import('./dist/index.js');
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

buildAndStart().catch(console.error);