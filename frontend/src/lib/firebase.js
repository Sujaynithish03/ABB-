import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDmy0-a9HGRJwbINKjMA-R1FoukAHQJO1o",
    authDomain: "plcv-817f5.firebaseapp.com",
    projectId: "plcv-817f5",
    storageBucket: "plcv-817f5.firebasestorage.app",
    messagingSenderId: "967010201686",
    appId: "1:967010201686:web:8c1f3edfbe22f25aaa0bf7",
    measurementId: "G-7TGZLKG577"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
