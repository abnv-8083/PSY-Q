import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function repairQuestions() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log(`Connecting to: ${uri.replace(/:([^@]+)@/, ':****@')}`);
    
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    console.log(`Connected to Database: ${db.databaseName}`);
    
    const sbTests = (await supabase.from('tests').select('id, name')).data;
    const mongoTests = await db.collection('tests').find({}).toArray();
    
    const mapping = {};
    sbTests.forEach(sb => {
      const match = mongoTests.find(m => m.name?.trim().toLowerCase() === sb.name?.trim().toLowerCase());
      if (match) mapping[sb.id] = match._id.toString();
    });
    
    for (const [sbId, mongoId] of Object.entries(mapping)) {
      await db.collection('questions').updateMany({ test_id: sbId }, { $set: { test_id: mongoId } });
    }
    
    const questionCounts = await db.collection('questions').aggregate([{ $group: { _id: "$test_id", count: { $sum: 1 } } }]).toArray();
    for (const stat of questionCounts) {
      if (stat._id && stat._id.length === 24) {
          await db.collection('tests').updateOne(
            { _id: new mongoose.Types.ObjectId(stat._id) },
            { $set: { total_questions: stat.count } }
          );
      }
    }
    
    console.log('Final check of ABNORMAL PSYCHOLOGY in this DB:');
    const ap = await db.collection('tests').findOne({ name: 'ABNORMAL PSYCHOLOGY' });
    console.log(`Score: ${ap?.total_questions}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
repairQuestions();
