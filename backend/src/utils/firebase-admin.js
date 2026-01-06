// src/config/firebase-admin.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load service account key
try {
  const serviceAccountPath = join(__dirname, '..', '..', 'firebase-service-account.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.warn('⚠️ Firebase Admin initialization failed:', error.message);
  console.log('⚠️ Running in development mode without Firebase');
  
  // For development without Firebase credentials
  admin.initializeApp({
    projectId: 'disease-detection-dev'
  });
}

export default admin;