// Simple script to create the first admin user
// Run this with: node server/seed.js

const bcrypt = require('bcrypt');
const admin = require('firebase-admin');

// Initialize Firebase with default credentials
const app = admin.initializeApp({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'photography-portfolio-dev',
});

const db = admin.firestore(app);

async function createAdminUser() {
  try {
    const username = 'admin';
    const password = 'admin123'; // Change this!
    const email = 'admin@example.com';
    
    // Check if admin user already exists
    const usersQuery = await db.collection('users').where('username', '==', username).limit(1).get();
    
    if (!usersQuery.empty) {
      console.log('Admin user already exists!');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const userData = {
      username,
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = db.collection('users').doc();
    await docRef.set(userData);
    
    console.log('Admin user created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('Please change the password after first login.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser();