import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {

  apiKey: "AIzaSyAZKKaLR_ZWKIDLFNWxO5VFCvHMVLgOuXU",

  authDomain: "pos-system-cda23.firebaseapp.com",

  projectId: "pos-system-cda23",

  storageBucket: "pos-system-cda23.firebasestorage.app",

  messagingSenderId: "363220038807",

  appId: "1:363220038807:web:ba6c282b15d6915832a5d2",

  measurementId: "G-MWJ1JTFQN0"

};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }; 
