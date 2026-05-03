import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Test } from '../models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend dir
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.error('❌ Error: Missing MONGODB_URI in backend/.env');
    process.exit(1);
}

async function migrate() {
    try {
        await mongoose.connect(mongoUri);
        console.log('🍃 Connected to MongoDB');

        const result = await Test.updateMany(
            {}, 
            { $set: { is_free_trial: true, free_trial_limit: 1 } }
        );

        console.log(`✅ Migration complete. Modified ${result.modifiedCount} tests.`);
    } catch (err) {
        console.error('❌ Error during migration:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

migrate();
