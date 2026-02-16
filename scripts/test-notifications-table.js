// Test script to verify notifications table exists and is accessible
import { supabase } from '../src/lib/supabaseClient.js';

async function testNotificationsTable() {
    console.log('=== Testing Notifications Table ===\n');

    // Test 1: Check if table exists by trying to select
    console.log('Test 1: Checking if table exists...');
    try {
        const { data, error, count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('❌ Error accessing table:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            if (error.code === '42P01') {
                console.error('\n🚨 TABLE DOES NOT EXIST!');
                console.error('You need to run the migration script: scripts/add_notifications_table.sql');
            } else if (error.code === '42501') {
                console.error('\n🚨 PERMISSION DENIED!');
                console.error('RLS policies may be blocking access. Check if you are authenticated as an admin.');
            }
            return false;
        }

        console.log('✅ Table exists!');
        console.log(`   Found ${count} notifications`);
        if (data && data.length > 0) {
            console.log('   Sample data:', data[0]);
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err);
        return false;
    }

    // Test 2: Try to insert a test notification
    console.log('\nTest 2: Attempting to create a test notification...');
    try {
        const testNotification = {
            image_url: 'https://via.placeholder.com/800x400',
            header: 'Test Notification',
            description: 'This is a test notification created by the verification script.',
            is_active: true,
            display_order: 999
        };

        const { data, error } = await supabase
            .from('notifications')
            .insert([testNotification])
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating notification:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            if (error.code === '42501') {
                console.error('\n🚨 PERMISSION DENIED!');
                console.error('This means:');
                console.error('1. The table exists');
                console.error('2. But RLS policies are blocking INSERT');
                console.error('3. You need to be authenticated as an admin user');
                console.error('\nTo fix:');
                console.error('- Make sure you are logged in as an admin in the app');
                console.error('- Check that your user has role: admin, sub-admin, or superadmin in the profiles table');
            }
            return false;
        }

        console.log('✅ Test notification created successfully!');
        console.log('   Created notification:', data);

        // Clean up - delete the test notification
        console.log('\nCleaning up test notification...');
        const { error: deleteError } = await supabase
            .from('notifications')
            .delete()
            .eq('id', data.id);

        if (deleteError) {
            console.warn('⚠️  Could not delete test notification:', deleteError);
        } else {
            console.log('✅ Test notification cleaned up');
        }

    } catch (err) {
        console.error('❌ Unexpected error during insert:', err);
        return false;
    }

    console.log('\n=== All Tests Passed! ===');
    return true;
}

// Run the test
testNotificationsTable()
    .then(success => {
        if (success) {
            console.log('\n✅ Database is properly configured!');
            console.log('If you still cannot create notifications in the UI:');
            console.log('1. Check browser console for errors');
            console.log('2. Make sure you are logged in as an admin');
            console.log('3. Verify your admin user has the correct role in Supabase profiles table');
        } else {
            console.log('\n❌ Database configuration issues detected. See errors above.');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('\n❌ Fatal error:', err);
        process.exit(1);
    });
