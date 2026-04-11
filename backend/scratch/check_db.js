import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' });

const TestSchema = new mongoose.Schema({
  name: String,
  subject: String,
  subject_id: String,
  is_active: Boolean,
  is_published: Boolean
}, { strict: false });

const Test = mongoose.model('Test', TestSchema);

async function checkTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const tests = await Test.find({});
    console.log(`Found ${tests.length} tests total.`);
    
    tests.forEach(t => {
      console.log(`[${t._id}] Name: ${t.name}, Subject: ${t.subject}, SubjectID: ${t.subject_id}, Active: ${t.is_active}, Published: ${t.is_published}`);
    });

    const subjects = await mongoose.connection.db.collection('subjects').find({}).toArray();
    console.log('\nSubjects in DB:');
    subjects.forEach(s => {
      console.log(`[${s._id}] Name: ${s.name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTests();
