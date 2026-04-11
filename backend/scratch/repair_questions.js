import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function repairQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // 1. Fetch Supabase Tests
    console.log('Fetching Supabase tests...');
    const { data: sbTests, error: sbError } = await supabase.from('tests').select('id, name');
    if (sbError) throw sbError;
    console.log(`Found ${sbTests.length} tests in Supabase.`);
    
    // 2. Fetch MongoDB Tests
    console.log('Fetching MongoDB tests...');
    const mongoTests = await db.collection('tests').find({}).toArray();
    console.log(`Found ${mongoTests.length} tests in MongoDB.`);
    
    // 3. Build Mapping (UUID -> MongoDB ID)
    // We match by name (case-insensitive, trimmed)
    const mapping = {};
    sbTests.forEach(sb => {
      const match = mongoTests.find(m => m.name?.trim().toLowerCase() === sb.name?.trim().toLowerCase());
      if (match) {
        mapping[sb.id] = match._id.toString();
      }
    });
    
    console.log(`Matched ${Object.keys(mapping).length} tests by name.`);
    
    // 4. Update Questions
    console.log('Updating questions...');
    let totalUpdated = 0;
    for (const [sbId, mongoId] of Object.entries(mapping)) {
      const result = await db.collection('questions').updateMany(
        { test_id: sbId },
        { $set: { test_id: mongoId } }
      );
      if (result.modifiedCount > 0) {
        // console.log(`  Updated ${result.modifiedCount} questions for test: ${mongoId}`);
        totalUpdated += result.modifiedCount;
      }
    }
    
    console.log(`\n✅ Total questions updated: ${totalUpdated}`);
    
    // 5. Update Test total_questions count
    console.log('Recalculating total_questions for tests...');
    const questionCounts = await db.collection('questions').aggregate([
      { $group: { _id: "$test_id", count: { $sum: 1 } } }
    ]).toArray();
    
    let testsUpdated = 0;
    for (const stat of questionCounts) {
      // Check if _id is a valid hex string (ObjectId)
      if (stat._id && stat._id.length === 24) {
          const result = await db.collection('tests').updateOne(
            { _id: new mongoose.Types.ObjectId(stat._id) },
            { $set: { total_questions: stat.count } }
          );
          if (result.modifiedCount > 0) testsUpdated++;
      }
    }
    
    console.log(`✅ Updated total_questions for ${testsUpdated} tests.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

repairQuestions();
