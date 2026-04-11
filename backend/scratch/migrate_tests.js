import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function migrateTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Find the Psychology subject
    const subject = await db.collection('subjects').findOne({ name: 'Psychology' });
    if (!subject) {
      console.error('Psychology subject not found!');
      process.exit(1);
    }
    
    const subjectId = subject._id.toString();
    console.log(`Found Psychology subject with ID: ${subjectId}`);
    
    // Update all tests that don't have a subject_id or have an empty one
    const result = await db.collection('tests').updateMany(
      { 
        $or: [
          { subject_id: { $exists: false } },
          { subject_id: null },
          { subject_id: "" }
        ]
      },
      { 
        $set: { 
          subject_id: subjectId,
          subject: 'Psychology',
          is_active: true,
          is_published: true
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} tests.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateTests();
