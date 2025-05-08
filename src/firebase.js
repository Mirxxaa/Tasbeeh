// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdQ9i1tzULeqBeDKkL19Ao_9wwIKzNT6M",
  authDomain: "tasbeeh-28344.firebaseapp.com",
  projectId: "tasbeeh-28344",
  storageBucket: "tasbeeh-28344.appspot.com",
  messagingSenderId: "846427999023",
  appId: "1:846427999023:web:1e1726a4b0af607da8efda",
  measurementId: "G-6S97CM8WZ7",
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);
