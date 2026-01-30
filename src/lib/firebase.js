import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth = {};
let db = {};
let functions = {};

try {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key') {
    throw new Error("Missing Firebase API Key. Please check your .env file.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Configure session persistence
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("Firebase auth persistence configured successfully.");
    })
    .catch((error) => {
      console.error("Error setting persistence:", error);
    });

  db = getFirestore(app);
  functions = getFunctions(app);
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Firebase Initialization Error:", error.message);
  // We use a timeout to ensure the alert doesn't block the initial render if possible, 
  // or just let it show if it's a critical failure.
  setTimeout(() => {
    alert("Psy-Q Error: Firebase could not initialize. " + error.message + "\n\nEnsure your .env file has the correct VITE_FIREBASE_... variables and restart the server.");
  }, 1000);
}

export { auth, db, functions, firebaseConfig };
export default app;
