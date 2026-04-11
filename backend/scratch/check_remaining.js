import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRemaining() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Find questions with non-ObjectId test_ids (i.e. UUID strings)
    const questions = await db.collection('questions').find({
        test_id: { $regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i }
    }).toArray();
    
    console.log(`Remaining questions with UUIDs: ${questions.length}`);
    
    if (questions.length > 0) {
        const uniqueTestIds = [...new Set(questions.map(q => q.test_id))];
        console.log(`Belonging to ${uniqueTestIds.length} UUID tests.`);
        
        for (const uuid of uniqueTestIds) {
            const { data } = await supabase.from('tests').select('name').eq('id', uuid).single();
            console.log(`UUID: ${uuid}, Name in Supabase: ${data?.name || "NOT FOUND"}`);
        }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRemaining();
