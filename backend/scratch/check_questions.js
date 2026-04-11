import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function checkQuestionStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Count questions total
    const totalQuestions = await db.collection('questions').countDocuments();
    console.log(`Total questions in DB: ${totalQuestions}`);
    
    // Aggregate questions by test_id
    const stats = await db.collection('questions').aggregate([
      { $group: { _id: "$test_id", count: { $sum: 1 } } }
    ]).toArray();
    
    console.log(`Questions grouped by test_id: ${stats.length} tests have questions.`);
    
    // Show some examples
    stats.slice(0, 5).forEach(s => {
      console.log(`TestID: ${s._id}, Count: ${s.count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkQuestionStats();
