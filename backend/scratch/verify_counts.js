import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const tests = await db.collection('tests').find({ total_questions: { $gt: 0 } }).limit(5).toArray();
  console.log(`Found ${tests.length} tests with questions > 0`);
  tests.forEach(t => console.log(`${t.name}: ${t.total_questions}`));
  process.exit(0);
}
verify();
