import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as Models from '../models/index.js';

dotenv.config();

// Supabase Config
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MongoDB Config
const mongoUri = process.env.MONGODB_URI;

async function migrate() {
    try {
        console.log("🚀 Starting Supabase to MongoDB Migration...");
        console.log("📍 Connecting to MongoDB...");
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

        for (const table of tables) {
            console.log(`\n📦 Migrating: ${table.name}...`);
            
            let allData = [];
            let from = 0;
            const step = 200; // Smaller batches to avoid timeouts
            let fetching = true;
            let batchCount = 0;

            // Fetch in batches to avoid Supabase limits
            while (fetching) {
                batchCount++;
                const { data, error } = await supabase
                    .from(table.name)
                    .select('*')
                    .range(from, from + step - 1);

                if (error) {
                    console.error(`  ❌ Error fetching ${table.name} (Batch ${batchCount}):`, error.message);
                    fetching = false;
                    continue;
                }

                if (!data || data.length === 0) {
                    fetching = false;
                    continue;
                }

                allData = [...allData, ...data];
                from += step;
                if (allData.length % 1000 === 0 || data.length < step) {
                    console.log(`  📦 Progress: Fetched ${allData.length} records for ${table.name}...`);
                }
            }

            if (allData.length === 0) {
                console.log(`  ⚠️ No data found in ${table.name}`);
                continue;
            }

            // Non-destructive: We no longer clear existing data
            console.log(`  🔍 Checking for new data to add to MongoDB: ${table.name}`);

            // Transform data (handling IDs if necessary)
            const docs = allData.map(item => {
                const doc = { ...item };
                
                // Specific transformation for Questions table
                if (table.name === 'questions') {
                    if (Array.isArray(doc.options) && typeof doc.options[0] === 'string') {
                        // Map flat string array to Mongoose expected format { id: string, text: string }
                        const transformedOptions = doc.options.map((optText, idx) => ({
                            id: `opt_${idx}`,
                            text: optText
                        }));
                        
                        doc.options = transformedOptions;
                        
                        // Map 'correct_key' index to 'correct_answer' ID
                        if (doc.correct_key !== undefined && doc.correct_key !== null) {
                            doc.correct_answer = `opt_${doc.correct_key}`;
                        }
                    }
                }
                
                return doc;
            });

            // Bulk Insert
            try {
                await table.model.insertMany(docs, { ordered: false });
                console.log(`  ✅ Successfully migrated ${allData.length} records.`);
            } catch (insertError) {
                console.warn(`  ⚠️ Some records failed or were duplicates in ${table.name}:`, insertError.message);
            }
        }

        console.log("\n🎉 Migration process finished successfully!");
    } catch (err) {
        console.error("❌ Migration failed with fatal error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
        process.exit();
    }
}

migrate();
