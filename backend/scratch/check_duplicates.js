import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const tests = await db.collection('tests').find({}).toArray();
  
  const counts = {};
  tests.forEach(t => {
    const name = t.name?.trim().toLowerCase();
    counts[name] = (counts[name] || 0) + 1;
  });
  
  const duplicates = Object.entries(counts).filter(([name, count]) => count > 1);
  console.log(`Found ${duplicates.length} duplicate test names.`);
  
  duplicates.slice(0, 5).forEach(([name, count]) => {
    console.log(`- ${name}: ${count} copies`);
  });

  process.exit(0);
}
checkDuplicates();
