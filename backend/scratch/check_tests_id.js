import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function checkTestsWithId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    const count = await db.collection('tests').countDocuments({ id: { $exists: true } });
    console.log(`Tests with 'id' field: ${count}`);
    
    if (count > 0) {
        const sample = await db.collection('tests').findOne({ id: { $exists: true } });
        console.log('Sample test with id:');
        console.log(JSON.stringify(sample, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTestsWithId();
