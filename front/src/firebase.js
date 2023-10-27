// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPX9YzRgAnostVqg9kRIhb4x10qP4fupQ",
  authDomain: "ip5offchain.firebaseapp.com",
  projectId: "ip5offchain",
  storageBucket: "ip5offchain.appspot.com",
  messagingSenderId: "909508068444",
  appId: "1:909508068444:web:e257ab1cb33bcd91bd1299",
  measurementId: "G-74RGZ0FXB3",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
export { db };
