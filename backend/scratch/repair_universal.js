import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // root .env

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function universalRepair() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log(`Repairing Database: ${db.databaseName}`);
    
    // 1. Fetch Supabase Tests (The Ground Truth)
    const { data: sbTests } = await supabase.from('tests').select('id, name');
    
    // 2. Fetch ALL MongoDB Tests
    const mongoTests = await db.collection('tests').find({}).toArray();
    
    console.log('Mapping results to ALL copies of tests...');
    
    for (const sb of sbTests) {
      const sbName = sb.name?.trim().toLowerCase();
      // Find ALL copies in Mongo
      const matches = mongoTests.filter(m => m.name?.trim().toLowerCase() === sbName);
      
      if (matches.length > 0) {
        // Update Questions to point to the FIRST match (we will eventually delete others)
        const primaryMongoId = matches[0]._id.toString();
        
        await db.collection('questions').updateMany(
            { test_id: sb.id }, // Supabase ID
            { $set: { test_id: primaryMongoId } }
        );
        
        // Count questions for this primary ID
        const qCount = await db.collection('questions').countDocuments({ test_id: primaryMongoId });
        
        // Update ALL copies in Mongo with the same data so they all show correct counts
        for (const match of matches) {
            await db.collection('tests').updateOne(
                { _id: match._id },
                { $set: { 
                    total_questions: qCount,
                    subject: 'Psychology',
                    subject_id: '69d68b7acf9894bc377d1e93', // Psychology ID
                    is_active: true,
                    is_published: true
                } }
            );
        }
      }
    }
    
    console.log('Final verification for ABNORMAL PSYCHOLOGY (All copies):');
    const apCopies = await db.collection('tests').find({ name: 'ABNORMAL PSYCHOLOGY' }).toArray();
    apCopies.forEach(t => console.log(`ID: ${t._id}, Questions: ${t.total_questions}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
universalRepair();
