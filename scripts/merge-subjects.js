
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, query, where, writeBatch } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function mergeSubjects(targetName) {
    console.log(`--- MERGING DUPLICATE SUBJECTS: ${targetName} ---`);

    const q = query(collection(db, 'subjects'), where('name', '==', targetName));
    const snap = await getDocs(q);

    if (snap.size <= 1) {
        console.log(`No duplicates found for ${targetName}.`);
        return;
    }

    const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const mainSubject = subjects[0];
    const duplicates = subjects.slice(1);

    console.log(`Main Subject ID: ${mainSubject.id}`);
    console.log(`Found ${duplicates.length} duplicates to merge.`);

    for (const dupe of duplicates) {
        console.log(`\nProcessing duplicate: ${dupe.id}`);

        // 1. Fetch tests from duplicate
        const testsSnap = await getDocs(collection(db, 'subjects', dupe.id, 'tests'));
        console.log(`  Moving ${testsSnap.size} tests...`);

        for (const testDoc of testsSnap.docs) {
            const testData = testDoc.data();
            const testId = testDoc.id;

            // Add test to main subject
            const newTestRef = await addDoc(collection(db, 'subjects', mainSubject.id, 'tests'), testData);
            console.log(`    - Moved test "${testData.name}" to ${newTestRef.id}`);

            // 2. Fetch questions for this test and move them
            const questionsSnap = await getDocs(collection(db, 'subjects', dupe.id, 'tests', testId, 'questions'));
            console.log(`      Moving ${questionsSnap.size} questions...`);

            const batch = writeBatch(db);
            for (const qDoc of questionsSnap.docs) {
                const qData = qDoc.data();
                const newQRef = doc(collection(db, 'subjects', mainSubject.id, 'tests', newTestRef.id, 'questions'));
                batch.set(newQRef, qData);
            }
            await batch.commit();
            console.log(`      Questions moved.`);
        }

        // 3. Delete duplicate subject
        // Note: We should delete sub-collections first if we were being thorough, 
        // but Firestore deleteDoc only deletes the document itself.
        // The tests/questions sub-collections will remain "orphaned" but invisible 
        // unless we delete them explicitly. 
        // For now, deleting the subject doc is enough to hide it from the UI.
        await deleteDoc(doc(db, 'subjects', dupe.id));
        console.log(`  Duplicate subject ${dupe.id} deleted.`);
    }

    console.log("\nMerge complete!");
}

mergeSubjects("Psychology").catch(console.error);
