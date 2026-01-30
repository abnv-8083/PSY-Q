
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '..', '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function diagnose() {
    console.log("--- DIXAGNOSING FIRESTORE DATA ---");

    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    console.log(`Found ${subjectsSnap.size} subjects.`);

    for (const subjectDoc of subjectsSnap.docs) {
        const data = subjectDoc.data();
        console.log(`\nSubject: ${data.name} (ID: ${subjectDoc.id})`);

        const testsSnap = await getDocs(collection(db, 'subjects', subjectDoc.id, 'tests'));
        console.log(`  Tests (${testsSnap.size}):`);
        for (const testDoc of testsSnap.docs) {
            const testData = testDoc.data();
            console.log(`    - ${testData.name} (ID: ${testDoc.id}, Price: ${testData.price})`);
        }
    }
}

diagnose().catch(console.error);
