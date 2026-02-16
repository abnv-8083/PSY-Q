import { supabase } from '../src/lib/supabaseClient.js';

async function checkData() {
    const { data: tests, error: testError } = await supabase.from('tests').select('id, name, price');
    if (testError) {
        console.error("Test Error:", testError);
    } else {
        console.log("--- TESTS ---");
        tests.forEach(t => console.log(`${t.name}: Price=${t.price} (ID: ${t.id})`));
    }

    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    // Note: This requires service_role key which I might not have.
    // I'll try just the public stats.
}

checkData();
