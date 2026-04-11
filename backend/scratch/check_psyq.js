import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // root .env

async function checkPsyqDB() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting...');
  // Force dbName to 'psyq'
  await mongoose.connect(uri, { dbName: 'psyq' });
  const db = mongoose.connection.db;
  console.log(`Connected to: ${db.databaseName}`);
  
  const tests = await db.collection('tests').countDocuments();
  console.log(`Tests in 'psyq' database: ${tests}`);
  
  if (tests > 0) {
      const t = await db.collection('tests').findOne({name: 'ABNORMAL PSYCHOLOGY'});
      console.log(`ABNORMAL PSYCHOLOGY ID in 'psyq': ${t?._id}`);
      console.log(`Count in 'psyq': ${t?.total_questions}`);
  }
  
  process.exit(0);
}
checkPsyqDB();
