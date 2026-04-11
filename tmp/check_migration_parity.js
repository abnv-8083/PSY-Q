import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as Models from '../backend/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

// Supabase Config
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MongoDB Config
const mongoUri = process.env.MONGODB_URI;

async function checkParity() {
    try {
        console.log("🔍 Checking Migration Parity (Supabase vs MongoDB)...");
        
        if (!mongoUri) {
            console.error("❌ MONGODB_URI is missing in .env");
            return;
        }

        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const tables = [
            { name: 'subjects', model: Models.Subject },
            { name: 'tests', model: Models.Test },
            { name: 'questions', model: Models.Question },
            { name: 'students', model: Models.Student },
            { name: 'admins', model: Models.Admin },
            { name: 'bookings', model: Models.Booking },
            { name: 'purchase_requests', model: Models.PurchaseRequest },
            { name: 'payments', model: Models.Payment },
            { name: 'bundles', model: Models.Bundle },
            { name: 'attempts', model: Models.Result }
        ];

        console.log("\n| Table Name | Supabase Count | MongoDB Count | Status |");
        console.log("|------------|----------------|---------------|--------|");

        for (const table of tables) {
            // Count Supabase
            const { count: sbCount, error: sbError } = await supabase
                .from(table.name)
                .select('*', { count: 'exact', head: true });

            // Count MongoDB
            const mongoCount = await table.model.countDocuments({});

            const status = (sbCount === mongoCount) ? "✅ Match" : (sbCount > mongoCount ? "❌ Missing in Mongo" : "➕ More in Mongo");
            
            console.log(`| ${table.name.padEnd(10)} | ${String(sbCount).padStart(14)} | ${String(mongoCount).padStart(13)} | ${status} |`);
            
            if (sbError) {
                console.error(`  Error counting ${table.name} in Supabase:`, sbError.message);
            }
        }

    } catch (err) {
        console.error("❌ Error during parity check:", err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkParity();
