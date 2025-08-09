
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "marketgazer-nghi0",
  "appId": "1:668489340834:web:11ba2add8e0ceec067c4fb",
  "storageBucket": "marketgazer-nghi0.firebasestorage.app",
  "apiKey": "AIzaSyD22M4_mGc-N_uOVOF8tvRGIT0QqgCSxuQ",
  "authDomain": "marketgazer-nghi0.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "668489340834"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
