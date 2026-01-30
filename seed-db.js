import { db } from './src/lib/firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

const seedData = async () => {
    try {
        const subjectRef = await addDoc(collection(db, 'subjects'), {
            name: 'Psychology 101',
            description: 'Introduction to Psychology guides and tests.',
            icon: '/logos/ignou.png'
        });

        const testRef = await addDoc(collection(db, 'subjects', subjectRef.id, 'tests'), {
            name: 'Full Length Mock Test 1',
            price: 0,
            duration: 60,
            isPublished: true
        });

        const questions = [
            {
                text: "Who is known as the father of Psychology?",
                options: ["Sigmund Freud", "Wilhelm Wundt", "William James", "B.F. Skinner"],
                correctKey: 1,
                explanation: "Wilhelm Wundt is widely regarded as the father of psychology for establishing the first experimental psychology lab."
            },
            {
                text: "What is the primary focus of Cognitive Psychology?",
                options: ["Social behavior", "Mental processes", "Biological structures", "Emotional disorders"],
                correctKey: 1,
                explanation: "Cognitive psychology is the scientific study of mind as an information processor."
            }
        ];

        for (const q of questions) {
            await addDoc(collection(db, 'subjects', subjectRef.id, 'tests', testRef.id, 'questions'), q);
        }

        console.log("Database seeded successfully!");
    } catch (e) {
        console.error("Error seeding database: ", e);
    }
};

// You can copy this into a temporary file or run it in your console to seed data.
// seedData();
