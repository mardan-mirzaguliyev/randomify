import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

async function setupAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found. Please register first.`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();
    
    console.log(`User ${email} is now an admin!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
