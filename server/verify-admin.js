import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

async function verifyAdmin() {
  const email = 'admin@randomify.com';
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      console.log(`User ${email} NOT found in database`);
      process.exit(1);
    }

    console.log(`User found:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Display Name: ${user.displayName}`);
    console.log(`  Plan: ${user.plan}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Has Password Hash: ${!!user.passwordHash}`);
    
    // Test password comparison
    const isMatch = await user.comparePassword('admin123');
    console.log(`  Password 'admin123' matches: ${isMatch}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyAdmin();
