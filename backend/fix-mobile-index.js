import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixMobileIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log('Database name:', dbName);
    
    const usersCollection = db.collection('users');
    
    // Check if collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      console.log('Users collection does not exist yet');
      process.exit(0);
    }

    // Get existing indexes
    const indexes = await usersCollection.indexes();
    console.log('Existing indexes:', indexes.map(i => i.name));

    // Drop the old mobile index if it exists
    const mobileIndex = indexes.find(i => i.name === 'mobile_1');
    if (mobileIndex) {
      try {
        await usersCollection.dropIndex('mobile_1');
        console.log('Dropped old mobile_1 index');
      } catch (error) {
        console.log('Could not drop mobile_1 index:', error.message);
      }
    } else {
      console.log('mobile_1 index does not exist');
    }

    // Update all existing users with empty string mobile to null
    const updateResult = await usersCollection.updateMany(
      { mobile: '' },
      { $set: { mobile: null } }
    );
    console.log(`Updated ${updateResult.modifiedCount} users with empty mobile to null`);

    // Create new sparse unique index on mobile
    await usersCollection.createIndex(
      { mobile: 1 },
      { unique: true, sparse: true }
    );
    console.log('Created new sparse unique index on mobile field');

    console.log('Mobile index fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

fixMobileIndex();
