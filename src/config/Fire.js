import firebase from 'firebase';
require("firebase/database");
require("firebase/auth");

const config = {

  apiKey: "AIzaSyDzFwimyRPPoxGlsjlhfJ19EhkSF4jAYIg",
  authDomain: "vidyalankar-canteen-app.firebaseapp.com",
  databaseURL: "https://vidyalankar-canteen-app-default-rtdb.firebaseio.com",
  projectId: "vidyalankar-canteen-app",
  storageBucket: "vidyalankar-canteen-app.firebasestorage.app",
  messagingSenderId: "390291982399",
  appId: "1:390291982399:web:099f8f7015fa7bd976508a",
  measurementId: "G-M46H6P7LDC"

};

const fire = firebase.initializeApp(config);

export const auth = firebase.auth();

export const storage = firebase.storage();

export const database = firebase.database();


export default fire;