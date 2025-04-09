const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
const envConfig = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    const line_trimmed = line.trim();
    if (line_trimmed && !line_trimmed.startsWith('#')) {
      const parts = line_trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        envConfig[key] = value;
      }
    }
  });
  
  // Set environment variables
  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
  
  console.log('Environment variables loaded successfully');
} catch (error) {
  console.error('Error loading .env file:', error.message);
}

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/doc-verification',
  jwtSecretKey: process.env.JWT_SECRET_KEY || 'default-secret-key',
  emailUsername: process.env.EMAIL_USERNAME,
  emailPassword: process.env.EMAIL_PASSWORD
}; 