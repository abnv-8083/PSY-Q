import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Question from './models/Question.js';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function testFetchAndInsert() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const { data, error } = await supabase.from('questions').select('*').limit(1);
        if (error) throw error;
        
        console.log("Supabase question:", JSON.stringify(data[0], null, 2));

        try {
            const newQ = new Question(data[0]);
            await newQ.validate();
            console.log("Validation passed!");
        } catch (vErr) {
            console.error("Validation failed:", vErr.errors);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}
testFetchAndInsert();
