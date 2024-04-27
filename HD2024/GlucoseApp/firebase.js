// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxDG4Ri4nVvGjB0WsC0YpCUWpunxEbJEo",
    authDomain: "hackdavis2024.firebaseapp.com",
    projectId: "hackdavis2024",
    storageBucket: "hackdavis2024.appspot.com",
    messagingSenderId: "699566713033",
    appId: "1:699566713033:web:a72405821a40b358370518",
    measurementId: "G-1KHY2NLWZL"
  };

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app()
}

const auth = firebase.auth();
const db = getDatabase();
export {firebaseConfig}; 