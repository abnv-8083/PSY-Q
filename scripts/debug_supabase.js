import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rkhsdukwyxypsbxhlppl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraHNkdWt3eXh5cHNieGhscHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODI2NzEsImV4cCI6MjA4NTM1ODY3MX0.c9DmFx9lqLO5GjXcY7vsNExg3yFMpzqUTqCdpwXivoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("--- DEBUGGING TEST DATA ---");

    // 1. Check Tests
    const { data: tests, error: testError } = await supabase.from('tests').select('id, name, price');
    if (testError) {
        console.error("Test Error:", testError);
        return;
    }

    console.log(`Found ${tests.length} tests:`);
    tests.forEach(t => console.log(`- ${t.name}: Price=${t.price} (Type: ${typeof t.price}) (ID: ${t.id})`));

    // 2. Check current user? (I can't do this easily from script without login)
    // But I can check ALL user_bundles and payments to see the distribution.

    const { data: ub, error: ubError } = await supabase.from('user_bundles').select('*');
    console.log(`\nFound ${ub?.length || 0} user_bundles entries.`);

    const { data: p, error: pError } = await supabase.from('payments').select('*');
    console.log(`Found ${p?.length || 0} payments entries.`);
}

checkData();
