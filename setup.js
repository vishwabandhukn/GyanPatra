#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MultiLang News Hub...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Create .env files if they don't exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');

if (!fs.existsSync(backendEnvPath)) {
  fs.writeFileSync(backendEnvPath, `PORT=5000
MONGODB_URI=mongodb://localhost:27017/multlang-news-hub
NODE_ENV=development
`);
  console.log('✅ Created backend/.env file');
}

if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, `VITE_API_URL=http://localhost:5000/api
`);
  console.log('✅ Created frontend/.env file');
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Start the backend server: cd backend && npm run dev');
console.log('3. Start the frontend server: cd frontend && npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📚 For more information, see README.md');




