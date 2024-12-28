// firebase/index.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from "firebase/functions"; // Unused if not using Firebase Functions
import { getAuth } from "firebase/auth";


//connection string
const firebaseConfig = {
    authDomain: "test-db-f78b1.firebaseapp.com",
    projectId: "test-db-f78b1",
    storageBucket: "test-db-f78b1.firebasestorage.app",
    messagingSenderId: "486095770828",
    appId: "1:486095770828:web:d23fa15c84534e608ade69"
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export const functions = getFunctions(app); // Uncomment if you're using Firebase Functions

// if (!import.meta?.env?.PROD) {
//     connectFirestoreEmulator(db, "localhost", 8080); // Use this if you're using Firestore emulator locally
// }

export { db, auth };
