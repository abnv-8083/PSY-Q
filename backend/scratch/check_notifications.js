import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function checkNotifications() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const count = await db.collection('notifications').countDocuments();
  console.log(`Total notifications in DB: ${count}`);
  
  if (count > 0) {
      const all = await db.collection('notifications').find({}).toArray();
      console.log('Notifications:');
      all.forEach(n => console.log(`[${n._id}] Header: ${n.header}, Active: ${n.is_active}`));
  }
  process.exit(0);
}
checkNotifications();
