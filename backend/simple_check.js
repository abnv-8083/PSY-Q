import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as Models from './models/index.js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
        console.log("✅ Mongo Connected");

        const collections = ['students', 'tests', 'subjects', 'bundles', 'questions'];
        
        for (const name of collections) {
            const { count: sbCount } = await supabase.from(name).select('*', { count: 'exact', head: true });
            
            let model;
            if (name === 'students') model = Models.Student;
            if (name === 'tests') model = Models.Test;
            if (name === 'subjects') model = Models.Subject;
            if (name === 'bundles') model = Models.Bundle;
            if (name === 'questions') model = Models.Question;

            const mgCount = await model.countDocuments();
            console.log(`${name}: Supabase=${sbCount}, Mongo=${mgCount}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}
check();
