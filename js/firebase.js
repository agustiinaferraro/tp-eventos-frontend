import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyBKmJoZ4AOxfoob5BNTVD_5yDiWHNXbY",
  authDomain: "eventos-5c6e2.firebaseapp.com",
  projectId: "eventos-5c6e2",
  storageBucket: "eventos-5c6e2.firebasestorage.app",
  messagingSenderId: "384718750905",
  appId: "1:384718750905:web:b072faacb5a65f269d4768",
  measurementId: "G-N18MBW04HW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
