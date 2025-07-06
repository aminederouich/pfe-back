const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDNGd51pR3Bh7UFTQHAxjIv6ZUUhO9xPGQ',
  authDomain: 'pfedb-7e93d.firebaseapp.com',
  projectId: 'pfedb-7e93d',
  storageBucket: 'pfedb-7e93d.appspot.com',
  messagingSenderId: '297768167520',
  appId: '1:297768167520:web:4c4904d6147f390edabb05',
  measurementId: 'G-5REQ2GZSGF',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { auth, db };
