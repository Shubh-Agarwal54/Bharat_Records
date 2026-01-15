import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndFixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(idx => {
      console.log(`  ${idx.name}:`, JSON.stringify(idx, null, 2));
    });

    // Drop the mobile_1 index completely
    console.log('\nDropping mobile_1 index...');
    try {
      await usersCollection.dropIndex('mobile_1');
      console.log('✓ Dropped mobile_1 index');
    } catch (error) {
      console.log('Could not drop index:', error.message);
    }

    // Update all users to have undefined mobile instead of null
    console.log('\nRemoving mobile field from users with null...');
    const updateResult = await usersCollection.updateMany(
      { mobile: null },
      { $unset: { mobile: "" } }
    );
    console.log(`✓ Updated ${updateResult.modifiedCount} users`);

    // DON'T create any index - let Mongoose handle it on restart
    console.log('\n✓ Mobile index removed. Restart server to let Mongoose sync.');

    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

checkAndFixIndex();
