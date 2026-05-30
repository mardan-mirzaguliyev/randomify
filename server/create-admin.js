import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@randomify.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const displayName = 'Admin User';
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`Updated existing user ${email} to admin`);
      process.exit(0);
    }

    // Create new admin user
    const hashedPassword = await User.hashPassword(password);
    
    const user = await User.create({
      email,
      passwordHash: hashedPassword,
      displayName,
      plan: 'lifetime',
      role: 'admin'
    });
    
    console.log(`Admin user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Please change the password after first login.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
