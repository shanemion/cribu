import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCo5ky-UpaIE_fV27_Q8cOOiNoheyMC3LY",
    authDomain: "cribu-22b6e.firebaseapp.com",
    projectId: "cribu-22b6e",
    storageBucket: "cribu-22b6e.firebasestorage.app",
    messagingSenderId: "928514010522",
    appId: "1:928514010522:web:a35d4a9955d337ce2b5e23",
    measurementId: "G-ZEZ961KZRH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app; 