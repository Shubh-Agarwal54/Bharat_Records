import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users with duplicate clientIds
    const duplicates = await usersCollection.aggregate([
      {
        $group: {
          _id: '$clientId',
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();

    console.log(`Found ${duplicates.length} duplicate clientIds`);

    // Keep the first document and remove the rest
    for (const dup of duplicates) {
      const [keep, ...remove] = dup.docs;
      console.log(`Keeping ${keep}, removing ${remove.length} duplicates for clientId: ${dup._id}`);
      
      if (remove.length > 0) {
        await usersCollection.deleteMany({
          _id: { $in: remove }
        });
      }
    }

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupDuplicates();
