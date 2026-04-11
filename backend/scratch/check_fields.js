import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function checkAllTestFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    const tests = await db.collection('tests').find({}).toArray();
    
    const allFields = new Set();
    tests.forEach(t => {
      Object.keys(t).forEach(k => allFields.add(k));
    });
    
    console.log('Fields present in ANY test document:');
    console.log(Array.from(allFields));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAllTestFields();
