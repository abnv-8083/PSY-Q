
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Firebase Config
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// Supabase Config
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("🚀 Starting Firebase to Supabase Migration...");

    // 1. Migrate Subjects
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    console.log(`Found ${subjectsSnap.size} subjects to migrate.`);

    for (const subjectDoc of subjectsSnap.docs) {
        const fbSubject = subjectDoc.data();
        const fbSubjectId = subjectDoc.id;

        // Insert into Supabase
        const { data: sbSubject, error: sbSubjectError } = await supabase
            .from('subjects')
            .upsert({ name: fbSubject.name, description: fbSubject.description })
            .select()
            .single();

        if (sbSubjectError) {
            console.error(`Error inserting subject ${fbSubject.name}:`, sbSubjectError);
            continue;
        }
        console.log(`✅ Subject Migrated: ${sbSubject.name} (${sbSubject.id})`);

        // 2. Migrate Tests for this Subject
        const testsSnap = await getDocs(collection(db, 'subjects', fbSubjectId, 'tests'));
        for (const testDoc of testsSnap.docs) {
            const fbTest = testDoc.data();
            const fbTestId = testDoc.id;

            const { data: sbTest, error: sbTestError } = await supabase
                .from('tests')
                .upsert({
                    subject_id: sbSubject.id,
                    name: fbTest.name,
                    price: fbTest.price,
                    duration: fbTest.duration,
                    is_published: fbTest.isPublished ?? true
                })
                .select()
                .single();

            if (sbTestError) {
                console.error(`Error inserting test ${fbTest.name}:`, sbTestError);
                continue;
            }
            console.log(`  📦 Test Migrated: ${sbTest.name}`);

            // 3. Migrate Questions for this Test
            const questionsSnap = await getDocs(collection(db, 'subjects', fbSubjectId, 'tests', fbTestId, 'questions'));
            if (questionsSnap.size > 0) {
                const questionsToInsert = questionsSnap.docs.map(qd => {
                    const qData = qd.data();
                    return {
                        test_id: sbTest.id,
                        text: qData.text,
                        options: qData.options,
                        correct_key: qData.correctKey ?? 0,
                        explanation: qData.explanation
                    };
                });

                const { error: sbQuestionsError } = await supabase
                    .from('questions')
                    .insert(questionsToInsert);

                if (sbQuestionsError) console.error(`  ❌ Error inserting questions for ${fbTest.name}:`, sbQuestionsError);
                else console.log(`    📝 ${questionsSnap.size} Questions Migrated.`);
            }
        }
    }

    console.log("\n🎉 Migration Complete!");
}

migrate().catch(console.error);
