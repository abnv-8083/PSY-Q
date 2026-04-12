import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const { data: sbNotifications, error } = await supabase.from('notifications').select('*');
    if (error) throw error;
    
    console.log(`Found ${sbNotifications.length} notifications in Supabase.`);
    
    if (sbNotifications.length > 0) {
        const docs = sbNotifications.map(n => ({
            header: n.header,
            description: n.description,
            image_url: n.image_url,
            is_active: n.is_active ?? true,
            display_order: n.display_order ?? 0,
            created_at: n.created_at || new Date()
        }));
        
        const res = await mongoose.connection.db.collection('notifications').insertMany(docs);
        console.log(`✅ Successfully migrated ${res.insertedCount} notifications.`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
migrateNotifications();
