import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function deduplicate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const tests = await db.collection('tests').find({}).toArray();
  const seen = new Set();
  const toDelete = [];
  
  // Sort tests so we keep the ones with IDs that seem 'newer' or consistent
  // Actually, we'll just keep the first one we encounter.
  tests.forEach(t => {
    const name = t.name?.trim().toLowerCase();
    if (seen.has(name)) {
      toDelete.push(t._id);
    } else {
      seen.add(name);
    }
  });
  
  console.log(`Deleting ${toDelete.length} duplicate tests...`);
  if (toDelete.length > 0) {
      const res = await db.collection('tests').deleteMany({ _id: { $in: toDelete } });
      console.log(`Deleted ${res.deletedCount} documents.`);
  }
  
  process.exit(0);
}
deduplicate();
