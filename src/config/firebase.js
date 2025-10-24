// Configuración de Firebase para Web
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBtyd316gOvtc8ftgsDDtSkmgB68x0PvSA',
  authDomain: 'babywise-auth.firebaseapp.com',
  projectId: 'babywise-auth',
  storageBucket: 'babywise-auth.firebasestorage.app',
  messagingSenderId: '1011273483061',
  appId: '1:1011273483061:web:YOUR_WEB_APP_ID', // Necesitarás crear una app web en Firebase
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Auth
export const auth = getAuth(app);

export default app;
