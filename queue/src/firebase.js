import firebase from 'firebase/compat/app';
import { getFirestore } from 'firebase/firestore';
import 'firebase/compat/auth';

// Configure Firebase.
const firebaseConfig = {
    apiKey: 'AIzaSyCxBRsWU_VJ25YqjJ8uEIcgw9hLv5l8ntk',
    authDomain: 'game-queue-97ad4.firebaseapp.com',
    projectId: 'game-queue-97ad4',
    storageBucket: 'game-queue-97ad4.appspot.com',
    messagingSenderId: '103933957743',
    appId: '1:103933957743:web:f23f34b27f12eb18f8df9a',
    measurementId: 'G-L33QFSY90W',
};
const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);

export { firebase, app, db }
