import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

// One-off migration: backfill the `role` field for users created before the
// switch from the `isAdmin` boolean to the `role` enum.
//
//   - Users flagged isAdmin: true  -> role: 'admin'
//   - Any user still missing a role -> role: 'user'
//
// Safe to run more than once.
async function migrateRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admins = await User.updateMany(
      { isAdmin: true },
      { $set: { role: 'admin' } }
    );
    console.log(`Promoted ${admins.modifiedCount} user(s) to admin`);

    const rest = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    console.log(`Defaulted ${rest.modifiedCount} user(s) to role 'user'`);

    // Drop the now-obsolete isAdmin field from all documents.
    const cleaned = await User.updateMany(
      { isAdmin: { $exists: true } },
      { $unset: { isAdmin: '' } }
    );
    console.log(`Removed obsolete isAdmin field from ${cleaned.modifiedCount} document(s)`);

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

migrateRoles();
