// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPqITk8MUePBE5j7TidlaUZx-NgV186gI",
  authDomain: "tripc-ffdc8.firebaseapp.com",
  projectId: "tripc-ffdc8",
  storageBucket: "tripc-ffdc8.firebasestorage.app",
  messagingSenderId: "22456443674",
  appId: "1:22456443674:web:894e7c2557c9eb411b02a3",
  measurementId: "G-85F1KSWMK5"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const analytics = getAnalytics(app);

export { auth};