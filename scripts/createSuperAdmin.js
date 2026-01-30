/**
 * Development Script: Create Super Admin User
 * 
 * This script creates a super admin account for development purposes.
 * Run this once to set up your admin access.
 * 
 * Usage: npm run create-admin
 */

import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createSuperAdmin() {
    try {
        console.log('\n🔐 Super Admin Account Creation\n');
        console.log('This will create a development super admin account.\n');

        // Get admin details
        const name = await question('Enter admin name (default: Super Admin): ') || 'Super Admin';
        const email = await question('Enter admin email (default: admin@psyq.com): ') || 'admin@psyq.com';
        const password = await question('Enter admin password (default: Admin@123): ') || 'Admin@123';
        const phone = await question('Enter admin phone (default: +1234567890): ') || '+1234567890';

        console.log('\n⏳ Creating super admin account...\n');

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ Firebase Auth user created:', user.uid);

        // Create user document in Firestore with admin role
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            phone: phone,
            role: 'admin',
            interest: 'Administration',
            createdAt: new Date().toISOString(),
            isSuperAdmin: true,
            permissions: {
                manageUsers: true,
                manageContent: true,
                manageSubAdmins: true,
                viewAnalytics: true,
                manageSettings: true
            }
        });

        console.log('✅ Firestore user document created with admin role');
        console.log('\n🎉 Super Admin Account Created Successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Name:', name);
        console.log('📱 Phone:', phone);
        console.log('🆔 User ID:', user.uid);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✨ You can now sign in at: http://localhost:5173/signin\n');

    } catch (error) {
        console.error('\n❌ Error creating super admin:', error.message);

        if (error.code === 'auth/email-already-in-use') {
            console.log('\n💡 This email is already registered. Try signing in instead.');
        } else if (error.code === 'auth/weak-password') {
            console.log('\n💡 Password should be at least 6 characters.');
        } else if (error.code === 'auth/invalid-email') {
            console.log('\n💡 Please provide a valid email address.');
        }
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Run the script
createSuperAdmin();
